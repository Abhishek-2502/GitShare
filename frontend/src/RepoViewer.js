import React, { useState, useEffect, useCallback, useRef} from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
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
  Button,
} from "@mui/material";
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
  Article as DocIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import axios from "axios";
import { motion } from "framer-motion";

import MarkdownViewer from "./components/MarkdownViewer";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import "github-markdown-css/github-markdown-light.css"; // light theme
import "github-markdown-css/github-markdown-dark.css"; // dark theme

function RepoViewer() {
  const { token, "*": repoPath } = useParams();
  const [content, setContent] = useState([]);
  const [currentPath, setCurrentPath] = useState("");
  const [fileLoading, setFileLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen] = useState(true);
  const [allFiles, setAllFiles] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const readmeOpened = useRef(false); // <-- prevent infinite loop
  

  // Extract path inside repo
  useEffect(() => {
    if (!repoPath) {
      setCurrentPath(""); // root folder
    } else {
      const segments = repoPath.split("/");
      // If last segment is a file (has extension), remove it
      if (segments[segments.length - 1].includes(".")) {
        segments.pop();
      }
      setCurrentPath(segments.join("/"));
    }
  }, [repoPath]);


  // Fetch content for the current path (non-recursive)
  const fetchContent = useCallback(
      async (path = repoPath || "") => {
        try {
          setError(null);
          setFileLoading(true);

          const response = await axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/api/repo-content/${token}?path=${path}`
          );

          if (Array.isArray(response.data)) {
            // It's a folder
            setContent(response.data);
            setFileContent(null);

            // Auto-open README.md if exists and not opened before
            if (!readmeOpened.current) {
              const readme = response.data.find(
                (item) =>
                  item.type === "file" && item.name.toLowerCase() === "readme.md"
              );
              if (readme) {
                readmeOpened.current = true; // mark as opened
                navigate(`/share/${token}/${readme.path}`, { replace: true });
              }
            }
          } else {
            // It's a file
            setFileContent(response.data);

            // Determine parent folder
            const segments = path.split("/");
            segments.pop(); // remove file name
            const parentPath = segments.join("/");

            // Fetch parent folder content for side navigator
            const folderResponse = await axios.get(
              `${process.env.REACT_APP_BACKEND_URL}/api/repo-content/${token}?path=${parentPath}`
            );

            setContent(Array.isArray(folderResponse.data) ? folderResponse.data : []);
            setCurrentPath(parentPath);
          }
        } catch (err) {
          setError(err.response?.data?.error || "Failed to load content");
          setContent([]);
          setFileContent(null);
        } finally {
          setFileLoading(false);
        }
      },
      [token, repoPath, navigate]
    );

  // Reset readmeOpened when path changes
  useEffect(() => {
    readmeOpened.current = false;
    fetchContent();
  }, [location.pathname, fetchContent]);


  // Recursive function to fetch all files in directory tree
  const fetchAllFilesRecursively = useCallback(
    async (path = "") => {
      try {
        setIsSearching(true);
        let allFiles = [];

        const fetchRecursive = async (currentPath) => {
          const response = await axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/api/repo-content/${token}?path=${currentPath}`
          );

          if (Array.isArray(response.data)) {
            for (const item of response.data) {
              if (item.type === "dir") {
                await fetchRecursive(item.path); // Recursively fetch subdirectories
              } else {
                allFiles.push(item); // Add file to results
              }
            }
          }
        };

        await fetchRecursive(path);
        return allFiles;
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load content");
        return [];
      } finally {
        setIsSearching(false);
      }
    },
    [token]
  );


  useEffect(() => {
    if (searchTerm.trim()) {
      const search = async () => {
        const results = await fetchAllFilesRecursively(currentPath);
        setAllFiles(results);
      };

      const debounceTimer = setTimeout(() => {
        search();
      }, 300); // Debounce to avoid too many requests

      return () => clearTimeout(debounceTimer);
    } else {
      setAllFiles([]);
    }
  }, [searchTerm, currentPath, fetchAllFilesRecursively]);

  // Function to navigate to a directory or load a file
  const navigateToPath = (item) => {
    navigate(`/share/${token}/${item.path}`);
  };

  // Function to go up one directory level
  const goUp = () => {
    // setCurrentPath(currentPath.split("/").slice(0, -1).join("/"));
    const parentPath = currentPath.split("/").slice(0, -1).join("/");
    navigate(`/share/${token}/${parentPath}`);
    setFileContent(null);
  };

  // Filtered content based on search term
  const filteredContent = searchTerm
    ? allFiles.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.path.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : content.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Render file icon based on extension
  const renderFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"];
    const docExtensions = ["doc", "docx", "odt"];
    const pdfExtensions = ["pdf"];

    if (imageExtensions.includes(extension))
      return <ImageIcon color="primary" />;
    if (pdfExtensions.includes(extension)) return <PdfIcon color="error" />;
    if (docExtensions.includes(extension)) return <DocIcon color="info" />;
    if (fileName.endsWith(".md")) return <DescriptionIcon color="success" />;
    return <CodeIcon color="secondary" />;
  };

  // Render file content based on type
  const renderFileContent = () => {
    if (!fileContent) return null;

    try {
      const decodedContent = atob(fileContent.content);
      const fileExtension = fileContent.name.split(".").pop().toLowerCase();
      console.log("File Extension:", fileExtension);

      // Define file type categories
      const imageExtensions = [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "bmp",
        "svg",
        "webp",
      ];
      const docExtensions = ["doc", "docx", "odt"];
      const pdfExtensions = ["pdf"];
      const textExtensions = [
        "txt",
        "md",
        "json",
        "xml",
        "csv",
        "log",
        "yaml",
        "yml",
        "ini",
        "conf",
        "properties",
        "bash",
        "sh",
        "zsh",
        "fish",
        "shell",
        "bat",
        "cmd",
        "license",
      ];
      const codeExtensions = [
        "js",
        "ts",
        "py",
        "rb",
        "java",
        "go",
        "sh",
        "yml",
        "yaml",
        "html",
        "css",
        "jsx",
        "tsx",
        "cpp",
        "c",
        "php",
        "sql",
        "scss",
      ];

      const languageMap = {
        js: "javascript",
        ts: "typescript",
        py: "python",
        rb: "ruby",
        java: "java",
        go: "go",
        sh: "bash",
        yml: "yaml",
        yaml: "yaml",
        json: "json",
        html: "html",
        css: "css",
        jsx: "jsx",
        tsx: "tsx",
        cpp: "cpp",
        c: "c",
        php: "php",
        sql: "sql",
        xml: "xml",
        txt: "text",
        scss: "scss",
        md: "markdown",
      };

      // FOR IMAGE FILES
      if (imageExtensions.includes(fileExtension)) {
        const imageUrl = `data:image/${fileExtension};base64,${fileContent.content}`;
        return (
          <Box sx={{ position: "relative", height: "100%" }}>
            <Box
              sx={{
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
              }}
            >
              <img
                src={imageUrl}
                alt={fileContent.name}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            </Box>
          </Box>
        );
      }

      // FOR MARKDOWN FILES
      if (fileContent.name.toLowerCase().endsWith(".md")) {
        const decodedContent = atob(fileContent.content);
        return (
          <Box
            sx={{ position: "relative", height: "100%", overflow: "hidden" }}
          >
            <MarkdownViewer
              markdown={decodedContent}
              token={token}
              currentPath={currentPath} // path of the folder where README is
              backendUrl={process.env.REACT_APP_BACKEND_URL}
            />
          </Box>
        );
      }

      // PDF FILES
      if (pdfExtensions.includes(fileExtension)) {
        const pdfUrl = `data:application/pdf;base64,${fileContent.content}`;
        return (
          <iframe
            src={pdfUrl}
            title={fileContent.name}
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        );
      }

      // DOC FILES
      if (docExtensions.includes(fileExtension)) {
        const docUrl = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${fileContent.content}`;
        return (
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
              window.location.origin + "/" + docUrl
            )}`}
            title={fileContent.name}
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        );
      }

      // FOR TEXT AND CODE FILES
      if (
        textExtensions.includes(fileExtension) ||
        codeExtensions.includes(fileExtension)
      ) {
        return (
          <Box sx={{ position: "relative", height: "100%" }}>
            <Box sx={{ height: "100%", overflow: "auto", p: 1 }}>
              <SyntaxHighlighter
                style={dracula}
                language={languageMap[fileExtension] || fileExtension}
                showLineNumbers
                wrapLines
                customStyle={{
                  margin: 0,
                  backgroundColor: theme.palette.grey[900],
                  fontSize: theme.typography.body1.fontSize,
                }}
              >
                {decodedContent}
              </SyntaxHighlighter>
            </Box>
          </Box>
        );
      }

      // FOR ALL OTHER FILE TYPES, SHOW DOWNLOAD PROMPT
      return (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
          }}
        >
          <FileIcon
            sx={{ fontSize: 60, mb: 2, color: theme.palette.grey[500] }}
          />
          <Typography variant="h6" gutterBottom>
            File Preview Not Available
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            This file type cannot be displayed in the browser.
          </Typography>
          <Button
            variant="contained"
            color="success"
            href={`data:application/octet-stream;base64,${fileContent.content}`}
            download={fileContent.name}
            startIcon={<DownloadIcon />}
            sx={{ mt: 2 }}
          >
            Download File
          </Button>
        </Box>
      );
    } catch (err) {
      // CATCH ANY ERROR DURING FILE RENDERING
      return (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
          }}
        >
          <Alert severity="error" sx={{ m: 2 }}>
            Failed to load file content. You can download it instead.
          </Alert>
          <Button
            variant="contained"
            color="primary"
            href={`data:application/octet-stream;base64,${fileContent.content}`}
            download={fileContent.name}
            startIcon={<DownloadIcon />}
            sx={{ mt: 2 }}
          >
            Download File
          </Button>
        </Box>
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
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: theme.palette.background.default,
        overflow: "hidden",
        mt: "44px",
        mb: "44px",
      }}
    >
      <CssBaseline />

      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: theme.palette.common.black,
          minHeight: "56px",
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            minHeight: "56px !important",
          }}
        >
          <Typography variant="h6" component="div" noWrap>
            GitHub Repository Viewer
          </Typography>
          <Typography variant="subtitle2" noWrap>
            Read-only Access
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          pt: 1,
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            px: 2,
            py: 1,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 1,
            alignItems: isMobile ? "flex-start" : "center",
          }}
        >
          <Breadcrumbs
            aria-label="breadcrumb"
            sx={{
              flex: 1,
              overflowX: "auto",
              whiteSpace: "nowrap",
              py: 0.5,
            }}
          >
            <MuiLink
              underline="hover"
              color="inherit"
              onClick={() => {
                setCurrentPath("");
                setFileContent(null);
              }}
              sx={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                "&:hover": { color: theme.palette.success.main },
              }}
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Root
            </MuiLink>
            {currentPath
              .split("/")
              .filter(Boolean)
              .map((segment, index, arr) => (
                <MuiLink
                  key={index}
                  underline="hover"
                  color="inherit"
                  onClick={() => {
                    // setCurrentPath(arr.slice(0, index + 1).join("/"));
                    const path = arr.slice(0, index + 1).join("/");
                    navigate(`/share/${token}/${path}`);
                    setFileContent(null);
                  }}
                  sx={{
                    cursor: "pointer",
                    "&:hover": { color: theme.palette.success.main },
                  }}
                >
                  {segment}
                </MuiLink>
              ))}
          </Breadcrumbs>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              width: isMobile ? "100%" : "auto",
              mt: isMobile ? 1 : 0,
            }}
          >
            <TextField
              size="small"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "action.active" }}
                  />
                ),
              }}
              sx={{
                flexGrow: isMobile ? 1 : undefined,
                minWidth: isMobile ? undefined : 250,
              }}
            />
            <Tooltip title="Refresh">
              <IconButton
                onClick={() => fetchContent(currentPath)}
                color="success"
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Container>

        <Container
          maxWidth={false}
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 2,
            overflow: "hidden",
            px: 2,
            pb: 2,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              flex: isMobile ? "0 0 auto" : "0 0 280px",
              width: "100%",
              height: isMobile ? "200px" : "100%",
              overflow: "auto",
              display: drawerOpen ? "block" : "none",
              borderRadius: 2,
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
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <UpIcon color="action" />
                  </ListItemIcon>
                  <ListItemText primary="Go up" />
                </ListItem>
              )}
              {isSearching ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <>
                  {filteredContent.map((item) => (
                    <React.Fragment key={item.path}>
                      <ListItem
                        button
                        onClick={() => navigateToPath(item)}
                        component={motion.div}
                        whileHover={{ x: 5 }}
                        sx={{
                          "&:hover": {
                            backgroundColor: theme.palette.action.hover,
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {item.type === "dir" ? (
                            <FolderIcon color="success" />
                          ) : (
                            renderFileIcon(item.name)
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.name}
                          secondary={
                            searchTerm
                              ? item.path.replace(currentPath + "/", "")
                              : item.type === "dir"
                              ? null
                              : `${(item.size / 1024).toFixed(2)} KB`
                          }
                          primaryTypographyProps={{ noWrap: true }}
                          secondaryTypographyProps={{ noWrap: true }}
                        />
                        {item.type !== "dir" && (
                          <Chip
                            label={item.name.split(".").pop()}
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
                        secondary={
                          searchTerm
                            ? "Try a different search term"
                            : "Empty directory"
                        }
                      />
                    </ListItem>
                  )}
                </>
              )}
            </List>
          </Paper>

          <Paper
            elevation={1}
            sx={{
              flex: 1,
              height: isMobile ? "calc(100vh - 380px)" : "100%",
              minHeight: isMobile ? "300px" : "auto",
              backgroundColor: theme.palette.grey[900],
              color: theme.palette.common.white,
              overflow: "auto",
              position: "relative",
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {fileLoading ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
              >
                <CircularProgress size={60} color="success" />
              </Box>
            ) : fileContent ? (
              <>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                    position: "sticky",
                    top: 0,
                    backgroundColor: theme.palette.grey[900],
                    zIndex: 1,
                    p: 2,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {renderFileIcon(fileContent.name)}
                    <Typography
                      variant="h6"
                      noWrap
                      sx={{ maxWidth: isMobile ? "200px" : "none" }}
                    >
                      {fileContent.name}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${(fileContent.size / 1024).toFixed(2)} KB`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                </Box>
                {renderFileContent()}
              </>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  textAlign: "center",
                  p: 3,
                }}
              >
                <DescriptionIcon
                  sx={{ fontSize: 60, color: "text.disabled", mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  No file selected
                </Typography>
                <Typography variant="body2">
                  {isMobile
                    ? "Tap on a file to view its content"
                    : "Click on a file to view its content"}
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
