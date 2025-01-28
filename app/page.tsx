"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Backdrop,
  Box,
  Button,
  CssBaseline,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LoginLogo from "./assets/images/loginLogo.png";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import CryptoJS from "crypto-js";
import loadingState from "../app/assets/images/loadingState.gif";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [sessionToken, setSessionToken] = useState("");
  const [ip, setIp] = useState("");
  const [openBackDrop, setOpenBackdrop] = useState(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const getData = async () => {
    const res = await axios.get("https://api.ipify.org/?format=json");
    setIp(res.data.ip);
  };

  useEffect(() => {
    getData();
  }, []);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const loginUser = async () => {
    setOpenBackdrop(true);
    try {
      const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
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

      const res = await axios.post(`/api/admin-login-session`, {
        p_username: username,
        p_passwordhash: encryptedPassword,
        p_ip_address: ip,
      });

      const responseCode = res.data.data.data[0].response_code;
      const responseMessage = res.data.data.data[0].response_message;

      if (responseCode === 0) {
        setSessionToken(responseMessage);
        await fetchSessionData(responseMessage);
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "Invalid response code.",
        });
      }

      console.log(res.data.data.data[0].response_code);
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

  const fetchSessionData = async (sessionToken: string) => {
    setUsername("");
    setPassword("");
    try {
      const response = await axios.get(
        `/api/admin-get-details-by-session?p_session_token=${sessionToken}`
      );

      console.log(response.data);
      const userData = response.data.data.data[0];

      if (userData.username !== "") {
        const { username, user_level_name, user_level } = userData;

        if (!username || !user_level_name) {
          throw new Error("Missing username or user level name");
        }

        const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;

        if (!encryptionKey) {
          throw new Error("Encryption key is not defined");
        }

        const encryptedUsername = CryptoJS.AES.encrypt(
          username,
          encryptionKey
        ).toString();
        const encryptedUserLevelName = CryptoJS.AES.encrypt(
          user_level_name,
          encryptionKey
        ).toString();

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
          title: "Admin account validated",
        });

        if (typeof window !== "undefined") {
          sessionStorage.setItem("key", user_level_name);
        }

        router.push(
          `/dashboard?un=${encodeURIComponent(
            encryptedUsername
          )}&uslvln=${encodeURIComponent(
            encryptedUserLevelName
          )}&lvl=${user_level}`
        );
      } else {
        Swal.fire({
          icon: "error",
          title: "Login unsuccessful",
        });
      }
    } catch (error: any) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.error || error.message,
      });
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#11AEE5",
      }}
    >
      <CssBaseline />
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={5}
          sx={{
            height: "70%",
            width: "40%",
            background: "rgba(236, 244, 251, 0.6)",
            backdropFilter: "blur(20px)",
            borderRadius: "64px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
          }}
        >
          <Box sx={{ height: "30%" }}>
            <Image width={600} height={150} src={LoginLogo} alt="logo" />
          </Box>
          <Box sx={{ height: "70%" }}>
            <Typography
              variant="h4"
              sx={{
                fontFamily: "'Sour Gummy', sans-serif",
                letterSpacing: 20,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "bolder",
                pb: "2.5rem",
              }}
            >
              ADMIN LOGIN
            </Typography>
            <Stack
              spacing={2}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <TextField
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                id="Username"
                label="Username"
                variant="filled"
                sx={{
                  width: "80%",
                }}
              />
              <TextField
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                label="Password"
                variant="filled"
                type={showPassword ? "text" : "password"}
                sx={{ width: "80%" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                disabled={openBackDrop === true}
                onClick={loginUser}
                variant="contained"
                color="info"
                sx={{ width: "80%" }}
              >
                {openBackDrop === true ? "Validating..." : "PROCEED"}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>

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
  );
}
