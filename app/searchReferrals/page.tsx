"use client";

import {
  Box,
  CssBaseline,
  Grid,
  Paper,
  Stack,
  Typography,
  TextField,
  Backdrop,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Suspense, useEffect, useState } from "react";
import ResponsiveDrawer from "../components/RespDraw";
import Swal from "sweetalert2";
import Image from "next/image";
import axios from "axios";
import loadingState from "../assets/images/loadingState.gif";
import Logo from "../assets/images/logo.png";
import Nodata from "../assets/images/noData.png";

type DirectRecruits = {
  id_no_display: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  mobile_no: string;
  region: string;
  province_district: string;
  city_municipality: string;
  barangay: string;
};

type InDirectRecruits = {
  id_no_display: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  mobile_no: string;
  region: string;
  province_district: string;
  city_municipality: string;
  barangay: string;
};

function useDebounce(value: any, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function SearchReferrals() {
  const [ip, setIp] = useState("");
  const [openBackDrop, setOpenBackdrop] = useState(false);

  const [APLIdNumber, setAPLIdNumber] = useState("");
  const [referrerName, setReffererName] = useState("");

  const [directRecruitsNumber, setDirectRecruitNumbers] = useState("");
  const [inDirectRecruitsNumber, setInDirectRecruitNumbers] = useState("");

  const [directData, setDirectData] = useState<DirectRecruits[]>([]);
  const [inDirectData, setInDirectData] = useState<InDirectRecruits[]>([]);

  const debouncedAPLIdNumber = useDebounce(APLIdNumber, 700);
  const debouncedReferrerName = useDebounce(referrerName, 700);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const getData = async () => {
    const res = await axios.get("https://api.ipify.org/?format=json");
    setIp(res.data.ip);
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (APLIdNumber === "") {
      setDirectData([]);
    }
  }, [APLIdNumber]);

  useEffect(() => {
    if (debouncedAPLIdNumber || debouncedReferrerName) {
      showDirectRecruits();
      showInDirectRecruits();
    }
  }, [debouncedAPLIdNumber, debouncedReferrerName]);

  const showDirectRecruits = async () => {
    setOpenBackdrop(true);
    try {
      const p_filter = APLIdNumber ? "0" : referrerName ? 1 : null;
      const res = await axios.post(`/api/admin-read-direct-recruits`, {
        p_filter: p_filter,
        p_referrer_id_no: APLIdNumber,
        p_referrer_name: referrerName,
      });

      const responseData = Array.isArray(res?.data?.data?.data)
        ? res.data.data.data
        : [];
      const sortedData = responseData.sort((a: any, b: any) => {
        const cityA = a.city_municipality?.toLowerCase() || "";
        const cityB = b.city_municipality?.toLowerCase() || "";
        return cityA.localeCompare(cityB);
      });

      setDirectRecruitNumbers(sortedData.length);
      setDirectData(sortedData);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Oops",
        text:
          error.response?.data?.error ||
          error.message ||
          "Something went wrong",
      });
    } finally {
      setOpenBackdrop(false);
    }
  };

  const showInDirectRecruits = async () => {
    setOpenBackdrop(true);
    try {
      const p_filter = APLIdNumber ? "0" : referrerName ? 1 : null;
      const res = await axios.post(`/api/admin-read-in-direct-recruits`, {
        p_filter: p_filter,
        p_referrer_id_no: APLIdNumber,
        p_referrer_name: referrerName,
      });

      const responseData = Array.isArray(res?.data?.data?.data)
        ? res.data.data.data
        : [];
      const sortedData = responseData.sort((a: any, b: any) => {
        const cityA = a.city_municipality?.toLowerCase() || "";
        const cityB = b.city_municipality?.toLowerCase() || "";
        return cityA.localeCompare(cityB);
      });

      setInDirectRecruitNumbers(sortedData.length);
      setInDirectData(sortedData);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Oops",
        text:
          error.response?.data?.error ||
          error.message ||
          "Something went wrong",
      });
    } finally {
      setOpenBackdrop(false);
    }
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
          <Box sx={{ height: "100%", width: "100%" }}>
            <Box
              sx={{
                height: "13%",
                width: "100%",
                px: 2,
                py: 3,
              }}
            >
              <Stack>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: "bolder",
                    letterSpacing: 2,
                    color: "#91ABC3",
                  }}
                >
                  Search Referrals
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bolder",
                    letterSpacing: 2,
                    color: "#91ABC3",
                  }}
                >
                  Search for the member list of the performing referrer
                </Typography>
              </Stack>
            </Box>
            <Box
              sx={{
                height: "13%",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                px: 2,
              }}
            >
              <Grid container>
                <Grid xs={9}>
                  <Grid container spacing={1}>
                    <Grid xs={6}>
                      <TextField
                        value={APLIdNumber}
                        onChange={(e) => setAPLIdNumber(e.target.value)}
                        id="Referral / APL - ID Number"
                        label="Referral / APL - ID Number"
                        variant="filled"
                        disabled={!!referrerName}
                        sx={{
                          width: "95%",
                          my: "1rem",
                          cursor: !!referrerName ? "not-allowed" : "text",
                          ".Mui-disabled": {
                            cursor: "not-allowed",
                          },
                        }}
                      />
                    </Grid>
                    <Grid xs={6}>
                      <TextField
                        value={referrerName}
                        onChange={(e) => setReffererName(e.target.value)}
                        id="Name of Referrer"
                        label="Name of Referrer"
                        variant="filled"
                        disabled={!!APLIdNumber}
                        sx={{
                          width: "95%",
                          my: "1rem",
                          cursor: !!APLIdNumber ? "not-allowed" : "text",
                          ".Mui-disabled": {
                            cursor: "not-allowed",
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  xs={3}
                >
                  <Stack
                    sx={{
                      color: "#91ABC3",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{ letterSpacing: 1, fontWeight: "bolder" }}
                    >
                      TOTAL RECRUITS
                    </Typography>
                    <Typography
                      variant="h3"
                      sx={{ letterSpacing: 2, fontWeight: "bolder" }}
                    >
                      {directRecruitsNumber + inDirectRecruitsNumber}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ height: "74%" }}>
              <Grid sx={{ height: "100%" }} container>
                <Grid
                  xs={6}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    px: 1,
                  }}
                >
                  <Stack
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: "bolder",
                        color: "#91ABC3",
                        letterSpacing: 2,
                      }}
                    >
                      Direct Recruits :{" "}
                      {directRecruitsNumber === "" ? "0" : directRecruitsNumber}
                    </Typography>
                  </Stack>
                  {directData.length === 0 ? (
                    <Box
                      sx={{
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Stack
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        spacing={2}
                      >
                        <Image src={Nodata} alt="logo" width={150} />
                        <Typography
                          variant="h5"
                          sx={{ fontWeight: "bolder", letterSpacing: 5 }}
                        >
                          NO DATA FETCHED
                        </Typography>
                      </Stack>
                    </Box>
                  ) : (
                    <TableContainer
                      className="custom-scrollbar small-text"
                      component={Paper}
                      sx={{
                        flexGrow: 1,
                        marginTop: 2,
                        maxHeight: "calc(98% - 50px)",
                        overflowY: "auto",
                      }}
                    >
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ background: "#E7F0FF" }}>
                              APL ID NUMBER
                            </TableCell>
                            <TableCell sx={{ background: "#E7F0FF" }}>
                              FIRST NAME
                            </TableCell>
                            <TableCell sx={{ background: "#E7F0FF" }}>
                              MIDDLE NAME
                            </TableCell>
                            <TableCell sx={{ background: "#E7F0FF" }}>
                              LAST NAME
                            </TableCell>
                            <TableCell sx={{ background: "#E7F0FF" }}>
                              MOBILE NUMBER
                            </TableCell>
                            <TableCell sx={{ background: "#E7F0FF" }}>
                              Region
                            </TableCell>
                            <TableCell sx={{ background: "#E7F0FF" }}>
                              Province
                            </TableCell>
                            <TableCell sx={{ background: "#E7F0FF" }}>
                              Municipality
                            </TableCell>
                            <TableCell sx={{ background: "#E7F0FF" }}>
                              Barangay
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {directData.map((item, index) => (
                            <TableRow key={item.id_no_display}>
                              <TableCell sx={{ padding: "4px 8px" }}>
                                {item.id_no_display}
                              </TableCell>
                              <TableCell sx={{ padding: "4px 8px" }}>
                                {item.first_name}
                              </TableCell>
                              <TableCell sx={{ padding: "4px 8px" }}>
                                {item.middle_name}
                              </TableCell>
                              <TableCell sx={{ padding: "4px 8px" }}>
                                {item.last_name}
                              </TableCell>
                              <TableCell sx={{ padding: "4px 8px" }}>
                                {item.mobile_no}
                              </TableCell>
                              <TableCell sx={{ padding: "4px 8px" }}>
                                {item.region}
                              </TableCell>
                              <TableCell sx={{ padding: "4px 8px" }}>
                                {item.province_district}
                              </TableCell>
                              <TableCell sx={{ padding: "4px 8px" }}>
                                {item.city_municipality}
                              </TableCell>
                              <TableCell sx={{ padding: "4px 8px" }}>
                                {item.barangay}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Grid>
                <Grid
                  xs={6}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    px: 1,
                  }}
                >
                  <Stack
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: "bolder",
                        color: "#91ABC3",
                        letterSpacing: 2,
                      }}
                    >
                      Indirect Recruits :{" "}
                      {inDirectRecruitsNumber === ""
                        ? "0"
                        : inDirectRecruitsNumber}
                    </Typography>
                  </Stack>
                  {inDirectData.length === 0 ? (
                    <Box
                      sx={{
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Stack
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        spacing={2}
                      >
                        <Image src={Nodata} alt="logo" width={150} />
                        <Typography
                          variant="h5"
                          sx={{ fontWeight: "bolder", letterSpacing: 5 }}
                        >
                          NO DATA FETCHED
                        </Typography>
                      </Stack>
                    </Box>
                  ) : (
                    <TableContainer
                      className="custom-scrollbar small-text"
                      component={Paper}
                      sx={{
                        flexGrow: 1,
                        marginTop: 2,
                        maxHeight: "calc(98% - 50px)",
                        overflowY: "auto",
                      }}
                    >
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ background: "#E7F0FF" }}>
                              APL ID NUMBER
                            </TableCell>
                            <TableCell sx={{ background: "#E7F0FF" }}>
                              FIRST NAME
                            </TableCell>
                            <TableCell sx={{ background: "#E7F0FF" }}>
                              MIDDLE NAME
                            </TableCell>
                            <TableCell sx={{ background: "#E7F0FF" }}>
                              LAST NAME
                            </TableCell>
                            <TableCell sx={{ background: "#E7F0FF" }}>
                              MOBILE NUMBER
                            </TableCell>
                            <TableCell sx={{ background: "#E7F0FF" }}>
                              Region
                            </TableCell>
                            <TableCell sx={{ background: "#E7F0FF" }}>
                              Province
                            </TableCell>
                            <TableCell sx={{ background: "#E7F0FF" }}>
                              Municipality
                            </TableCell>
                            <TableCell sx={{ background: "#E7F0FF" }}>
                              Barangay
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {inDirectData.map((item, index) => (
                            <TableRow key={item.id_no_display}>
                              <TableCell sx={{ padding: "4px 8px" }}>
                                {item.id_no_display}
                              </TableCell>
                              <TableCell sx={{ padding: "4px 8px" }}>
                                {item.first_name}
                              </TableCell>
                              <TableCell sx={{ padding: "4px 8px" }}>
                                {item.middle_name}
                              </TableCell>
                              <TableCell sx={{ padding: "4px 8px" }}>
                                {item.last_name}
                              </TableCell>
                              <TableCell sx={{ padding: "4px 8px" }}>
                                {item.mobile_no}
                              </TableCell>
                              <TableCell sx={{ padding: "4px 8px" }}>
                                {item.region}
                              </TableCell>
                              <TableCell sx={{ padding: "4px 8px" }}>
                                {item.province_district}
                              </TableCell>
                              <TableCell sx={{ padding: "4px 8px" }}>
                                {item.city_municipality}
                              </TableCell>
                              <TableCell sx={{ padding: "4px 8px" }}>
                                {item.barangay}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Grid>
              </Grid>
            </Box>
          </Box>
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
    </Suspense>
  );
}
