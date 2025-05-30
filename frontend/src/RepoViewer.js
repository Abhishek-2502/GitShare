import React, { useState, useEffect } from 'react';
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
  Button,
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
  CssBaseline
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
  GitHub as GitHubIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

function RepoViewer() {
  const { token } = useParams();
  const [content, setContent] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);

  useEffect(() => {
    fetchContent();
  }, [currentPath, token]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/repo-content/${token}?path=${currentPath}`
      );

      if (Array.isArray(response.data)) {
        setContent(response.data);
      } else {
        setFileContent(response.data);
        return;
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load content');
      setContent([]);
      setFileContent(null);
    } finally {
      setLoading(false);
    }
  };

  const navigateToPath = async (item) => {
    if (item.type === 'dir') {
      setCurrentPath(item.path);
      setFileContent(null);
      if (isMobile) setDrawerOpen(false);
    } else {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/repo-content/${token}?path=${item.path}`
        );
        setFileContent(response.data);
        if (isMobile) setDrawerOpen(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load file content');
      } finally {
        setLoading(false);
      }
    }
  };

  const goUp = () => {
    setCurrentPath(currentPath.split('/').slice(0, -1).join('/'));
    setFileContent(null);
  };

  const filteredContent = content.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderFileContent = () => {
    if (!fileContent) return null;

    try {
      const decodedContent = atob(fileContent.content);
      const fileExtension = fileContent.name.split('.').pop();
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
        md: 'markdown',
        html: 'html',
        css: 'css',
        scss: 'scss'
      };

      if (fileContent.name.endsWith('.md')) {
        return (
          <Box sx={{ 
            maxWidth: '100%', 
            overflow: 'auto',
            color: theme.palette.common.white,
            '& h1, & h2, & h3, & h4, & h5, & h6': {
              marginTop: theme.spacing(2),
              marginBottom: theme.spacing(1),
              color: theme.palette.common.white
            },
            '& p': {
              marginBottom: theme.spacing(1),
              color: theme.palette.common.white
            },
            '& ul, & ol': {
              paddingLeft: theme.spacing(4),
              marginBottom: theme.spacing(2),
              color: theme.palette.common.white
            },
            '& a': {
              color: theme.palette.primary.light
            },
            '& pre': {
              backgroundColor: theme.palette.grey[900],
              borderRadius: theme.shape.borderRadius,
              padding: theme.spacing(2)
            },
            '& code': {
              backgroundColor: theme.palette.grey[900]
            }
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
      } else {
        return (
          <Box sx={{ maxWidth: '100%', overflow: 'auto' }}>
            <SyntaxHighlighter
              style={dracula}
              language={languageMap[fileExtension] || fileExtension}
              showLineNumbers
              wrapLines
              customStyle={{ 
                margin: 0, 
                borderRadius: theme.shape.borderRadius,
                backgroundColor: theme.palette.grey[900],
                fontSize: theme.typography.body1.fontSize
              }}
            >
              {decodedContent}
            </SyntaxHighlighter>
          </Box>
        );
      }
    } catch (err) {
      return (
        <Alert severity="error">
          Failed to decode file content
        </Alert>
      );
    }
  };

  if (loading && !fileContent) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

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
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default
      }}
    >
      <CssBaseline />
      
      {/* Header */}
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" component="div">
              GitHub Repository Viewer
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ mr: 2 }}>
              Read-only Access
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box component="main" sx={{ flex: 1, py: 2 }}>
        <Container maxWidth={false} sx={{ height: '100%' }}>
          {/* Breadcrumbs and Search */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: 1,
              mb: 2
            }}
          >
            <Breadcrumbs aria-label="breadcrumb">
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
                  '&:hover': { color: theme.palette.primary.main }
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
                    '&:hover': { color: theme.palette.primary.main }
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
                <IconButton onClick={fetchContent} color="primary">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Two-column layout */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            gap: 2,
            height: 'calc(100vh - 180px)',
            overflow: 'hidden'
          }}>
            {/* Left: File/Directory List */}
            {(drawerOpen || !isMobile) && (
              <Paper 
                elevation={1}
                sx={{ 
                  flex: isMobile ? '0 0 auto' : '0 0 300px',
                  width: isMobile ? '100%' : 'auto',
                  height: '100%',
                  overflow: 'auto',
                  display: drawerOpen ? 'block' : 'none'
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
                            <FolderIcon color="primary" />
                          ) : (
                            <FileIcon color="secondary" />
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
            )}

            {/* Right: File Content Viewer */}
            <Paper
              elevation={1}
              sx={{
                flex: 1,
                height: '100%',
                overflow: 'auto',
                backgroundColor: theme.palette.grey[900],
                color: theme.palette.common.white,
                position: 'relative'
              }}
            >
              {fileContent ? (
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
                      {fileContent.name.endsWith('.md') ? (
                        <DescriptionIcon color="primary" />
                      ) : (
                        <CodeIcon color="secondary" />
                      )}
                      <Typography variant="h6" noWrap sx={{ maxWidth: isMobile ? '200px' : 'none', color: theme.palette.common.white }}>
                        {fileContent.name}
                      </Typography>
                    </Box>
                    <Chip 
                      label={`${(fileContent.size / 1024).toFixed(2)} KB`} 
                      size="small" 
                      variant="outlined"
                      sx={{ color: theme.palette.common.white }}
                    />
                  </Box>
                  <Box sx={{ p: 2 }}>
                    {renderFileContent()}
                  </Box>
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
                    p: 3,
                    color: theme.palette.common.white
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
          </Box>
        </Container>
      </Box>

    </Box>
  );
}

export default RepoViewer;