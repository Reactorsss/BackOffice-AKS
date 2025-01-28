"use client";

import {
  Box,
  CssBaseline,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Backdrop,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Menu,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { CiEdit } from "react-icons/ci";
import { Suspense, useEffect, useState } from "react";
import ResponsiveDrawer from "../components/RespDraw";
import Swal from "sweetalert2";
import CryptoJS from "crypto-js";
import Image from "next/image";
import axios from "axios";
import loadingState from "../assets/images/loadingState.gif";
import Logo from "../assets/images/logo.png";

export default function CreateAdmin() {
  const [ip, setIp] = useState("");
  const [openBackDrop, setOpenBackdrop] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isCreateAdmin, setIsCreateAdmin] = useState(true);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [adminRole, setAdminRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordMatchEdit, setPasswordMatchEdit] = useState(true);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [isSubmitEnabledEdit, setIsSubmitEnabledEdit] = useState(false);
  const [hasStartedTypingRetype, setHasStartedTypingRetype] = useState(false);
  const [hasStartedTypingRetypeEdit, setHasStartedTypingRetypeEdit] =
    useState(false);

  const [userAdminData, setUserAdminData] = useState([]);
  const [passwordEdit, setPasswordEdit] = useState(false);
  const [usernameToEditPassword, setUsernameToEditPassword] = useState("");
  const [usernameToChangeStatus, setUsernameToChangeStatus] = useState(0);

  const [usernameEditing, setUsernameEditing] = useState("");
  const [passwordEditing, setPasswordEditing] = useState("");
  const [reTypepasswordEditing, setReTypePasswordEditing] = useState("");

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const getData = async () => {
    const res = await axios.get("https://api.ipify.org/?format=json");
    setIp(res.data.ip);
  };

  useEffect(() => {
    getData();
  }, []);

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleModeToEditOpen = (
    event: any,
    usernameToUse: string,
    isActive: any
  ) => {
    setUsernameToEditPassword(usernameToUse);
    setUsernameToChangeStatus(isActive);
    setAnchorEl(event.currentTarget);
  };

  const handleModeToEditClose = () => {
    setAnchorEl(null);
  };

  const handleModeSelect = (selectedMode: any) => {
    handleModeToEditClose();
  };

  const openPasswordModal = () => {
    handleModeToEditClose();
    setPasswordEdit(true);
  };

  const closePasswordModal = () => {
    setPasswordEdit(false);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const match = password === retypePassword && password !== "";
      setPasswordMatch(match);
      setIsSubmitEnabled(match);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [password, retypePassword]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const match =
        passwordEditing === reTypepasswordEditing && passwordEditing !== "";
      setPasswordMatchEdit(match);
      setIsSubmitEnabledEdit(match);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [passwordEditing, reTypepasswordEditing]);

  const handleRetypePasswordChange = (e: any) => {
    if (!hasStartedTypingRetype) {
      setHasStartedTypingRetype(true);
    }
    setRetypePassword(e.target.value);
  };

  const handleRetypePasswordChangeEditing = (e: any) => {
    if (!hasStartedTypingRetypeEdit) {
      setHasStartedTypingRetypeEdit(true);
    }
    setReTypePasswordEditing(e.target.value);
  };

  const createUser = async () => {
    setOpenBackdrop(true);
    const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;

    try {
      if (!encryptionKey) {
        throw new Error("Encryption key is not defined");
      }

      const fixedSalt = CryptoJS.enc.Utf8.parse("your_fixed_salt");
      const fixedIv = CryptoJS.enc.Utf8.parse("your_fixed_iv");

      const encryptedPassword = CryptoJS.AES.encrypt(
        password,
        CryptoJS.enc.Utf8.parse(encryptionKey),
        { iv: fixedIv, salt: fixedSalt }
      ).toString();

      const res = await axios.post(`/api/admin-create`, {
        p_username: username,
        p_passwordhash: encryptedPassword,
        p_user_level: adminRole,
        p_ip_address: ip,
      });

      if (res.data.data.data[0].response_code === 0) {
        setUsername("");
        setPassword("");
        setRetypePassword("");
        setAdminRole("");
        setHasStartedTypingRetype(false);
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });

        Toast.fire({
          icon: "success",
          title: "Admin user registered",
        });
      } else if (res.data.data.data[0].response_code === -1) {
        setHasStartedTypingRetype(false);
        Swal.fire({
          icon: "error",
          title: "Oops",
          text: "Invalid user level.",
        });
      } else if (res.data.data.data[0].response_code === -2) {
        setHasStartedTypingRetype(false);
        setUsername("");
        Swal.fire({
          icon: "error",
          title: "Oops",
          text: "Username already exists.",
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Oops",
        text: error.response?.data?.error || error.message,
      });
    } finally {
      setOpenBackdrop(false);
    }
  };

  const adminAllUser = async () => {
    setOpenBackdrop(true);
    setUsername("");
    setPassword("");
    try {
      const response = await axios.get(`/api/admin-get-all-users`);

      setUserAdminData(response.data.data.data);
    } catch (error: any) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.error || error.message,
      });
    } finally {
      setOpenBackdrop(false);
    }
  };

  const adminUpdatePassword = async () => {
    setOpenBackdrop(true);
    setPasswordEdit(false);
    const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;

    try {
      if (!encryptionKey) {
        throw new Error("Encryption key is not defined");
      }

      const fixedSalt = CryptoJS.enc.Utf8.parse("your_fixed_salt");
      const fixedIv = CryptoJS.enc.Utf8.parse("your_fixed_iv");

      const encryptedPassword = CryptoJS.AES.encrypt(
        passwordEditing,
        CryptoJS.enc.Utf8.parse(encryptionKey),
        { iv: fixedIv, salt: fixedSalt }
      ).toString();

      const res = await axios.patch(`/api/admin-update-password`, {
        p_username: usernameToEditPassword,
        p_passwordhash: encryptedPassword,
        p_ip_address: ip,
      });
      if (res.data.data.data[0].response_code === 0) {
        setUsernameEditing("");
        setPasswordEditing("");
        setReTypePasswordEditing("");
        setHasStartedTypingRetypeEdit(false);
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });

        Toast.fire({
          icon: "success",
          title: "Admin user password changed",
        });
      } else if (res.data.data.data[0].response_code === -1) {
        setHasStartedTypingRetype(false);
        Swal.fire({
          icon: "error",
          title: "Oops",
          text: "Account does not exists.",
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Oops",
        text: error.response?.data?.error || error.message,
      });
    } finally {
      setOpenBackdrop(false);
    }
  };

  const adminUpdateStatus = async () => {
    setOpenBackdrop(true);

    try {
      const res = await axios.patch(`/api/admin-update-status`, {
        p_username: usernameToEditPassword,
        p_ip_address: ip,
      });
      if (res.data.data.data[0].response_code === 0) {
        adminAllUser();
        setUsernameEditing("");
        setPasswordEditing("");
        setReTypePasswordEditing("");
        setHasStartedTypingRetypeEdit(false);
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });

        Toast.fire({
          icon: "success",
          title: "Admin user status changed",
        });
      } else if (res.data.data.data[0].response_code === -1) {
        setHasStartedTypingRetype(false);
        Swal.fire({
          icon: "error",
          title: "Oops",
          text: "Account does not exists.",
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Oops",
        text: error.response?.data?.error || error.message,
      });
    } finally {
      setOpenBackdrop(false);
    }
  };

  const changeStatus = () => {
    handleModeToEditClose();
    Swal.fire({
      icon: "info",
      title: `Change Status for ${usernameToEditPassword}`,
      text: `This action will change the status of this user from ${
        usernameToChangeStatus === 1
          ? "ACTIVE to INACTIVE"
          : "INACTIVE to ACTIVE"
      }`,
      confirmButtonText: "PROCEED",
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        adminUpdateStatus();
      }
    });
  };

  return (
    <Suspense>
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          background: "#ECF4FB",
        }}
      >
        <CssBaseline />
        <ResponsiveDrawer />
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            overflow: "hidden",
          }}
        >
          <Grid container>
            <Image
              src={Logo}
              alt="Logo"
              style={{
                position: "absolute",
                right: ".5rem",
              }}
              width={90}
              height={90}
            />

            {isCreateAdmin === true ? (
              <Box
                sx={{
                  height: "100%",
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Paper
                  elevation={5}
                  sx={{
                    height: "80%",
                    width: "60%",
                  }}
                >
                  <Box sx={{ p: 5, display: "flex", justifyContent: "center" }}>
                    <Typography
                      variant="h4"
                      sx={{
                        color: "#91ABC3",
                        letterSpacing: 2,
                        fontWeight: "bolder",
                      }}
                    >
                      Create an Admin Account
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Stack spacing={2} sx={{ width: "70%" }}>
                      <Stack>
                        <Typography>Username</Typography>
                        <TextField
                          sx={{ width: "100%" }}
                          variant="outlined"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </Stack>
                      <Stack>
                        <Typography>Password</Typography>
                        <TextField
                          sx={{ width: "100%" }}
                          variant="outlined"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={handleTogglePasswordVisibility}
                                >
                                  {showPassword ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Stack>
                      <Stack>
                        <Typography>Re-type Password</Typography>
                        <TextField
                          sx={{ width: "100%" }}
                          variant="outlined"
                          type={showPassword ? "text" : "password"}
                          value={retypePassword}
                          onChange={handleRetypePasswordChange}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={handleTogglePasswordVisibility}
                                >
                                  {showPassword ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                        {!passwordMatch && hasStartedTypingRetype && (
                          <Typography color="error" variant="body2">
                            Passwords do not match.
                          </Typography>
                        )}
                      </Stack>
                      <Stack spacing={0.5}>
                        <Typography>Select Role</Typography>
                        <FormControl sx={{ width: "100%" }}>
                          <InputLabel id="username-select-label">
                            Admin Role
                          </InputLabel>
                          <Select
                            labelId="username-select-label"
                            id="username-select"
                            value={adminRole}
                            onChange={(e) => setAdminRole(e.target.value)}
                            label="Admin Role"
                          >
                            <MenuItem value="1">Super Admin</MenuItem>
                            <MenuItem value="2">Admin</MenuItem>
                            <MenuItem value="3">User</MenuItem>
                          </Select>
                        </FormControl>
                      </Stack>
                      <Grid
                        container
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Grid
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                          item
                          xs={6}
                        >
                          <Button
                            color="warning"
                            variant="contained"
                            disabled={!isSubmitEnabled}
                            onClick={createUser}
                            sx={{
                              width: "80%",
                              background: "#FEC842",
                              color: "black",
                            }}
                          >
                            Submit
                          </Button>
                        </Grid>
                        <Grid
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                          item
                          xs={6}
                        >
                          <Button
                            onClick={() => {
                              setIsCreateAdmin(false);
                              adminAllUser();
                            }}
                            variant="outlined"
                            sx={{ width: "80%" }}
                          >
                            Show Admins
                          </Button>
                        </Grid>
                      </Grid>
                    </Stack>
                  </Box>
                </Paper>
              </Box>
            ) : (
              <Box
                sx={{
                  height: "100%",
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Paper
                  elevation={5}
                  sx={{
                    height: "75%",
                    width: "90%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Grid
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    container
                  >
                    <Grid item xs={6}>
                      <Typography
                        onClick={() => adminAllUser()}
                        variant="h4"
                        sx={{
                          px: 5,
                          pt: 2,
                          color: "#91ABC3",
                          letterSpacing: 2,
                          fontWeight: "bolder",
                        }}
                      >
                        Admin Users
                      </Typography>
                    </Grid>
                    <Grid
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        px: 5,
                      }}
                      item
                      xs={6}
                    >
                      <Button
                        onClick={() => setIsCreateAdmin(true)}
                        variant="outlined"
                        sx={{
                          width: "50%",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        Create Admin
                      </Button>
                    </Grid>
                  </Grid>

                  <TableContainer
                    sx={{ mt: 3, px: 2 }}
                    className="custom-scrollbar small-text1"
                  >
                    <Table>
                      <TableHead>
                        <TableRow sx={{ background: "#E7F0FF" }}>
                          <TableCell sx={{ textAlign: "center" }}>
                            Username
                          </TableCell>
                          <TableCell sx={{ textAlign: "center" }}>
                            Role
                          </TableCell>
                          <TableCell sx={{ textAlign: "center" }}>
                            Created at
                          </TableCell>
                          <TableCell sx={{ textAlign: "center" }}>
                            Status
                          </TableCell>
                          <TableCell sx={{ textAlign: "center" }}>
                            Action
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {userAdminData.map((row: any) => (
                          <TableRow key={row.id}>
                            <TableCell sx={{ textAlign: "center" }}>
                              {row.username}
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                              {row.user_level_name}
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                              {new Date(row.created_at)
                                .toISOString()
                                .replace("T", " ")
                                .slice(0, 19)}
                            </TableCell>
                            <TableCell
                              sx={{
                                textAlign: "center",
                                color: row.is_active === 1 ? "green" : "red",
                              }}
                            >
                              {row.is_active === 1 ? "ACTIVE" : "INACTIVE"}
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                              <CiEdit
                                onClick={(event) =>
                                  handleModeToEditOpen(
                                    event,
                                    row.username,
                                    row.is_active
                                  )
                                }
                                style={{ cursor: "pointer" }}
                              />
                            </TableCell>
                            <Menu
                              anchorEl={anchorEl}
                              open={Boolean(anchorEl)}
                              onClose={handleModeToEditClose}
                            >
                              <MenuItem onClick={() => openPasswordModal()}>
                                EDIT PASSWORD
                              </MenuItem>
                              <MenuItem onClick={() => changeStatus()}>
                                EDIT STATUS
                              </MenuItem>
                            </Menu>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Box>
            )}
          </Grid>
        </Box>

        <Dialog
          fullScreen={fullScreen}
          open={passwordEdit}
          // onClose={handleClose}
          aria-labelledby="responsive-dialog-title"
        >
          <Box>
            <DialogContent>
              <Box>
                <Typography>
                  Edit password for {usernameToEditPassword}
                </Typography>
              </Box>
              <Grid
                sx={{ paddingY: "2rem" }}
                container
                spacing={1}
                justifyContent="center"
              >
                <Grid item xs={12} md={12}>
                  <TextField
                    sx={{ width: "100%" }}
                    variant="outlined"
                    value={usernameToEditPassword}
                    label="Username *"
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <TextField
                    sx={{ width: "100%" }}
                    variant="outlined"
                    type={showPassword ? "text" : "password"}
                    value={passwordEditing}
                    label="Password *"
                    onChange={(e) => setPasswordEditing(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleTogglePasswordVisibility}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <TextField
                    sx={{ width: "100%" }}
                    variant="outlined"
                    type={showPassword ? "text" : "password"}
                    value={reTypepasswordEditing}
                    label="Confirm Password *"
                    onChange={handleRetypePasswordChangeEditing}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleTogglePasswordVisibility}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  {!passwordMatchEdit && hasStartedTypingRetypeEdit && (
                    <Typography color="error" variant="body2">
                      Passwords do not match.
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button
                variant="outlined"
                color="error"
                onClick={closePasswordModal}
              >
                cancel
              </Button>
              <Button
                variant="contained"
                color="success"
                disabled={!isSubmitEnabledEdit}
                onClick={adminUpdatePassword}
                autoFocus
              >
                Edit Password
              </Button>
            </DialogActions>
          </Box>
        </Dialog>

        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={openBackDrop}
        >
          <Image
            width={300}
            height={250}
            src={loadingState}
            alt="loading State"
          />
        </Backdrop>
      </Box>
    </Suspense>
  );
}
