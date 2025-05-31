import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
  TextField,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Chip,
  AppBar,
  Toolbar,
  Container,
  CssBaseline,
  Button
} from '@mui/material';
import {
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  ArrowUpward as UpIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Code as CodeIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Article as DocIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function RepoViewer() {
  const { token } = useParams();
  const [content, setContent] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [numPages, setNumPages] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(true);

  const fetchContent = useCallback(async () => {
    try {
      setError(null);
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/repo-content/${token}?path=${currentPath}`
      );

      if (Array.isArray(response.data)) {
        setContent(response.data);
      } else {
        setFileContent(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load content');
      setContent([]);
      setFileContent(null);
    }
  }, [token, currentPath]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const navigateToPath = async (item) => {
    if (item.type === 'dir') {
      setCurrentPath(item.path);
      setFileContent(null);
    } else {
      try {
        setFileLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/repo-content/${token}?path=${item.path}`
        );
        setFileContent(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load file content');
      } finally {
        setFileLoading(false);
      }
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const goUp = () => {
    setCurrentPath(currentPath.split('/').slice(0, -1).join('/'));
    setFileContent(null);
  };

  const filteredContent = content.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
    const docExtensions = ['doc', 'docx', 'odt'];
    const pdfExtensions = ['pdf'];

    if (imageExtensions.includes(extension)) return <ImageIcon color="primary" />;
    if (pdfExtensions.includes(extension)) return <PdfIcon color="error" />;
    if (docExtensions.includes(extension)) return <DocIcon color="info" />;
    if (fileName.endsWith('.md')) return <DescriptionIcon color="success" />;
    return <CodeIcon color="secondary" />;
  };

  const renderFileContent = () => {
    if (!fileContent) return null;

    try {
      const decodedContent = atob(fileContent.content);
      const fileExtension = fileContent.name.split('.').pop().toLowerCase();
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
      const docExtensions = ['doc', 'docx', 'odt'];
      const pdfExtensions = ['pdf'];

      if (imageExtensions.includes(fileExtension)) {
        const imageUrl = `data:image/${fileExtension};base64,${fileContent.content}`;
        return (
          <Box sx={{ 
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 2
          }}>
            <img 
              src={imageUrl} 
              alt={fileContent.name} 
              style={{ 
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }} 
            />
          </Box>
        );
      }

      if (pdfExtensions.includes(fileExtension)) {
        const pdfUrl = `data:application/pdf;base64,${fileContent.content}`;
        return (
          <Box sx={{ height: '100%', overflow: 'auto', p: 1 }}>
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <CircularProgress color="success" />
                </Box>
              }
            >
              {Array.from(new Array(numPages), (el, index) => (
                <Box key={`page_${index + 1}`} sx={{ mb: 2 }}>
                  <Page 
                    pageNumber={index + 1} 
                    width={isMobile ? 300 : 600}
                    renderTextLayer={false}
                  />
                </Box>
              ))}
            </Document>
          </Box>
        );
      }

      if (docExtensions.includes(fileExtension)) {
        return (
          <Box sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2
          }}>
            <PdfIcon sx={{ fontSize: 60, mb: 2, color: theme.palette.info.main }} />
            <Typography variant="h6" gutterBottom>
              DOCX/DOC Viewer
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              For full document viewing capabilities, please download the file.
            </Typography>
            <Button 
              variant="contained" 
              color="info"
              href={`data:application/octet-stream;base64,${fileContent.content}`}
              download={fileContent.name}
            >
              Download Document
            </Button>
          </Box>
        );
      }

      if (fileContent.name.endsWith('.md')) {
        return (
          <Box sx={{ 
            height: '100%',
            overflow: 'auto',
            p: 2,
            color: theme.palette.common.white
          }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={dracula}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {decodedContent}
            </ReactMarkdown>
          </Box>
        );
      }

      const languageMap = {
        js: 'javascript',
        ts: 'typescript',
        py: 'python',
        rb: 'ruby',
        java: 'java',
        go: 'go',
        sh: 'bash',
        yml: 'yaml',
        yaml: 'yaml',
        json: 'json',
        html: 'html',
        css: 'css',
        scss: 'scss'
      };

      return (
        <Box sx={{ height: '100%', overflow: 'auto', p: 1 }}>
          <SyntaxHighlighter
            style={dracula}
            language={languageMap[fileExtension] || fileExtension}
            showLineNumbers
            wrapLines
            customStyle={{ 
              margin: 0, 
              backgroundColor: theme.palette.grey[900],
              fontSize: theme.typography.body1.fontSize
            }}
          >
            {decodedContent}
          </SyntaxHighlighter>
        </Box>
      );
    } catch (err) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          Failed to decode file content
        </Alert>
      );
    }
  };

  if (error) {
    return (
      <Container sx={{ p: 2 }}>
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: theme.palette.background.default,
        overflow: 'hidden'
      }}
    >
      <CssBaseline />
      
      <AppBar position="static" elevation={0} sx={{ 
        backgroundColor: theme.palette.common.black,
        minHeight: '56px'
      }}>
        <Toolbar sx={{ 
          justifyContent: 'space-between',
          minHeight: '56px !important'
        }}>
          <Typography variant="h6" component="div" noWrap>
            GitHub Repository Viewer
          </Typography>
          <Typography variant="subtitle2" noWrap>
            Read-only Access
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        pt: 1
      }}>
        <Container maxWidth={false} sx={{ 
          px: 2,
          py: 1,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 1,
          alignItems: isMobile ? 'flex-start' : 'center'
        }}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ 
            flex: 1,
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            py: 0.5
          }}>
            <MuiLink
              underline="hover"
              color="inherit"
              onClick={() => {
                setCurrentPath('');
                setFileContent(null);
              }}
              sx={{ 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center',
                '&:hover': { color: theme.palette.success.main }
              }}
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Root
            </MuiLink>
            {currentPath.split('/').filter(Boolean).map((segment, index, arr) => (
              <MuiLink
                key={index}
                underline="hover"
                color="inherit"
                onClick={() => {
                  setCurrentPath(arr.slice(0, index + 1).join('/'));
                  setFileContent(null);
                }}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { color: theme.palette.success.main }
                }}
              >
                {segment}
              </MuiLink>
            ))}
          </Breadcrumbs>

          <Box sx={{ 
            display: 'flex',
            gap: 1,
            width: isMobile ? '100%' : 'auto',
            mt: isMobile ? 1 : 0
          }}>
            <TextField
              size="small"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />,
              }}
              sx={{ 
                flexGrow: isMobile ? 1 : undefined,
                minWidth: isMobile ? undefined : 250
              }}
            />
            <Tooltip title="Refresh">
              <IconButton onClick={fetchContent} color="success">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Container>

        <Container maxWidth={false} sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 2,
          overflow: 'hidden',
          px: 2,
          pb: 2
        }}>
          <Paper 
            elevation={1}
            sx={{ 
              flex: isMobile ? '0 0 auto' : '0 0 280px',
              width: '100%',
              height: isMobile ? '200px' : '100%',
              overflow: 'auto',
              display: drawerOpen ? 'block' : 'none',
              borderRadius: 2
            }}
          >
            <List sx={{ p: 0 }}>
              {currentPath && (
                <ListItem
                  button
                  onClick={goUp}
                  component={motion.div}
                  whileHover={{ x: 5 }}
                  sx={{
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <UpIcon color="action" />
                  </ListItemIcon>
                  <ListItemText primary="Go up" />
                </ListItem>
              )}
              {filteredContent.map((item) => (
                <React.Fragment key={item.path}>
                  <ListItem
                    button
                    onClick={() => navigateToPath(item)}
                    component={motion.div}
                    whileHover={{ x: 5 }}
                    sx={{
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {item.type === 'dir' ? (
                        <FolderIcon color="success" />
                      ) : (
                        renderFileIcon(item.name)
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.name}
                      primaryTypographyProps={{ noWrap: true }}
                      secondary={item.type === 'dir' ? null : `${(item.size / 1024).toFixed(2)} KB`}
                    />
                    {item.type !== 'dir' && (
                      <Chip
                        label={item.name.split('.').pop()}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
              {filteredContent.length === 0 && (
                <ListItem>
                  <ListItemText 
                    primary="No files found" 
                    secondary={searchTerm ? "Try a different search term" : "Empty directory"}
                  />
                </ListItem>
              )}
            </List>
          </Paper>

          <Paper
            elevation={1}
            sx={{
              flex: 1,
              height: isMobile ? 'calc(100vh - 380px)' : '100%',
              minHeight: isMobile ? '300px' : 'auto',
              overflow: 'auto',
              backgroundColor: theme.palette.grey[900],
              color: theme.palette.common.white,
              position: 'relative',
              borderRadius: 2
            }}
          >
            {fileLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress size={60} color="success" />
              </Box>
            ) : fileContent ? (
              <>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 2,
                    position: 'sticky',
                    top: 0,
                    backgroundColor: theme.palette.grey[900],
                    zIndex: 1,
                    p: 2,
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {renderFileIcon(fileContent.name)}
                    <Typography variant="h6" noWrap sx={{ maxWidth: isMobile ? '200px' : 'none' }}>
                      {fileContent.name}
                    </Typography>
                  </Box>
                  <Chip 
                    label={`${(fileContent.size / 1024).toFixed(2)} KB`} 
                    size="small" 
                    variant="outlined"
                  />
                </Box>
                {renderFileContent()}
              </>
            ) : (
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  textAlign: 'center',
                  p: 3
                }}
              >
                <DescriptionIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No file selected
                </Typography>
                <Typography variant="body2">
                  {isMobile ? 'Tap on a file to view its content' : 'Click on a file to view its content'}
                </Typography>
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}

export default RepoViewer;