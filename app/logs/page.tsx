"use client";

import {
  Box,
  CssBaseline,
  Grid,
  Paper,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Backdrop,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { useTheme } from "@mui/material/styles";
import { Suspense, useEffect, useState } from "react";
import ResponsiveDrawer from "../components/RespDraw";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import Image from "next/image";
import axios from "axios";
import loadingState from "../assets/images/loadingState.gif";
import Logo from "../assets/images/logo.png";
import SearchIcon from "@mui/icons-material/Search";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";

export default function Logs() {
  const [ip, setIp] = useState("");
  const [openBackDrop, setOpenBackdrop] = useState(false);
  const [eventsLogsData, setEvenLogsData] = useState([]);

  const defaultDateFrom = dayjs().startOf("day");
  const defaultDateTo = dayjs().endOf("day");

  const [selectedDateFrom, setSelectedDateFrom] = useState<string | null>(
    defaultDateFrom.format("YYYY-MM-DD HH:mm:ss")
  );
  const [selectedDateTo, setSelectedDateTo] = useState<string | null>(
    defaultDateTo.format("YYYY-MM-DD HH:mm:ss")
  );

  const [sortBy, setSortBy] = useState<string | null>(null); // For column name
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // For sorting order

  const [searchQuery, setSearchQuery] = useState<string>("");

  const theme = useTheme();

  const getData = async () => {
    const res = await axios.get("https://api.ipify.org/?format=json");
    setIp(res.data.ip);
  };

  useEffect(() => {
    getData();
  }, []);

  const handleDateChangeFrom = (newValue: any) => {
    if (newValue) {
      setSelectedDateFrom(dayjs(newValue).format("YYYY-MM-DD HH:mm:ss"));
    }
  };

  const handleDateChangeTo = (newValue: any) => {
    if (newValue) {
      setSelectedDateTo(dayjs(newValue).format("YYYY-MM-DD HH:mm:ss"));
    }
  };

  const eventsLog = async () => {
    setOpenBackdrop(true);

    try {
      const res = await axios.post(`/api/events-logs`, {
        p_date_from: selectedDateFrom,
        p_date_to: selectedDateTo,
      });

      // console.log(res.data.data.data);
      setEvenLogsData(res.data.data.data);
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

  useEffect(() => {
    eventsLog();
  }, []);

  const filteredData = eventsLogsData.filter((row) => {
    return Object.values(row).some((val) => {
      if (val !== null && val !== undefined) {
        return val.toString().toLowerCase().includes(searchQuery.toLowerCase());
      }
      return false;
    });
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSort = (column: string) => {
    const newSortOrder =
      sortBy === column && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(column);
    setSortOrder(newSortOrder);
  };

  const sortedData = [...filteredData].sort((a: any, b: any) => {
    if (sortBy) {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      const aIsEmpty = aValue === null || aValue === "";
      const bIsEmpty = bValue === null || bValue === "";

      if (aIsEmpty && bIsEmpty) return 0;
      if (aIsEmpty) return sortOrder === "asc" ? -1 : 1;
      if (bIsEmpty) return sortOrder === "asc" ? 1 : -1;

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    }
    return 0;
  });

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
            <Box sx={{ height: "100%", width: "100%" }}>
              <Box
                sx={{
                  height: "10%",
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
                    Audit Logs
                  </Typography>
                </Stack>
              </Box>
              <Box
                sx={{
                  height: "10%",
                  px: 2,
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
              >
                <Grid container>
                  <Grid item xs={8}>
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{
                        display: "flex",
                        justifyContent: "flex-start",
                        alignItems: "center",
                      }}
                    >
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DemoContainer components={["DateTimePicker"]}>
                          <DateTimePicker
                            label="Date from"
                            value={dayjs(selectedDateFrom)}
                            onChange={handleDateChangeFrom}
                            format="MM/DD/YYYY HH:mm:ss"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "20px",
                                fontSize: "0.75rem",
                              },
                              "& .MuiInputLabel-root": {
                                fontSize: "0.75rem",
                              },
                            }}
                          />
                        </DemoContainer>
                      </LocalizationProvider>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DemoContainer components={["DateTimePicker"]}>
                          <DateTimePicker
                            label="Date to"
                            value={dayjs(selectedDateTo)}
                            onChange={handleDateChangeTo}
                            format="MM/DD/YYYY HH:mm:ss"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "20px",
                                fontSize: "0.75rem",
                              },
                              "& .MuiInputLabel-root": {
                                fontSize: "0.75rem",
                              },
                            }}
                          />
                        </DemoContainer>
                      </LocalizationProvider>
                      <Button
                        variant="contained"
                        onClick={() => eventsLog()}
                        color="info"
                      >
                        FETCH DATA
                      </Button>
                    </Stack>
                  </Grid>
                  <Grid
                    item
                    xs={4}
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                    }}
                  >
                    <TextField
                      variant="outlined"
                      sx={{
                        width: "80%",
                        borderRadius: "50px",
                        backgroundColor: "white",
                      }}
                      placeholder="Search"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: "gray" }} />
                          </InputAdornment>
                        ),
                        sx: {
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#ccc",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#999",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#007FFF",
                          },
                          fontSize: "1rem",
                          height: "32px",
                          minHeight: "unset",
                          paddingTop: "12px",
                          paddingBottom: "12px",
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
              <Box
                sx={{
                  height: "80%",
                  px: 2,
                }}
              >
                <Paper
                  sx={{
                    overflowX: "auto",
                    overflowY: "auto",
                    maxHeight: "600px",
                    maxWidth: "auto",
                    minHeight: "600px",
                    display: "flex",
                    flexDirection: "column",
                    p: 2,
                  }}
                >
                  <TableContainer className="custom-scrollbar small-text">
                    <Table size="small" sx={{ minWidth: 700, flex: 1 }}>
                      <TableHead>
                        <TableRow
                          sx={{
                            background: "#E7F0FF",
                            position: "sticky",
                            top: 0,
                            zIndex: 2,
                          }}
                        >
                          <TableCell sx={{ textAlign: "center", py: 0.5 }}>
                            ID
                          </TableCell>
                          <TableCell onClick={() => handleSort("event_name")}>
                            <Grid container>
                              <Grid xs={6}>
                                <Typography variant="caption">
                                  Event Name
                                </Typography>
                              </Grid>
                              <Grid
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                }}
                                xs={6}
                              >
                                {sortBy === "event_name" ? (
                                  sortOrder === "asc" ? (
                                    <ArrowUpward
                                      style={{
                                        fontSize: "1.1rem",
                                        cursor: "pointer",
                                      }}
                                    />
                                  ) : (
                                    <ArrowDownward
                                      style={{
                                        fontSize: "1.1rem",
                                        cursor: "pointer",
                                      }}
                                    />
                                  )
                                ) : (
                                  <ArrowDownward
                                    fontSize="small"
                                    style={{ opacity: 0.3 }}
                                  />
                                )}
                              </Grid>
                            </Grid>
                          </TableCell>
                          <TableCell onClick={() => handleSort("event_desc")}>
                            <Grid container>
                              <Grid xs={6}>
                                <Typography variant="caption">
                                  Event Description
                                </Typography>
                              </Grid>
                              <Grid
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                }}
                                xs={6}
                              >
                                {sortBy === "event_desc" ? (
                                  sortOrder === "asc" ? (
                                    <ArrowUpward
                                      style={{
                                        fontSize: "1.1rem",
                                        cursor: "pointer",
                                      }}
                                    />
                                  ) : (
                                    <ArrowDownward
                                      style={{
                                        fontSize: "1.1rem",
                                        cursor: "pointer",
                                      }}
                                    />
                                  )
                                ) : (
                                  <ArrowDownward
                                    fontSize="small"
                                    style={{ opacity: 0.3 }}
                                  />
                                )}
                              </Grid>
                            </Grid>
                          </TableCell>
                          <TableCell onClick={() => handleSort("created_at")}>
                            <Grid container>
                              <Grid xs={6}>
                                <Typography variant="caption">
                                  Created At
                                </Typography>
                              </Grid>
                              <Grid
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                }}
                                xs={6}
                              >
                                {sortBy === "created_at" ? (
                                  sortOrder === "asc" ? (
                                    <ArrowUpward
                                      style={{
                                        fontSize: "1.1rem",
                                        cursor: "pointer",
                                      }}
                                    />
                                  ) : (
                                    <ArrowDownward
                                      style={{
                                        fontSize: "1.1rem",
                                        cursor: "pointer",
                                      }}
                                    />
                                  )
                                ) : (
                                  <ArrowDownward
                                    fontSize="small"
                                    style={{ opacity: 0.3 }}
                                  />
                                )}
                              </Grid>
                            </Grid>
                          </TableCell>

                          <TableCell sx={{ textAlign: "center", py: 0.5 }}>
                            IP Address
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody
                        sx={{
                          verticalAlign: "top",
                        }}
                      >
                        {sortedData.map((row: any) => (
                          <TableRow key={row.id}>
                            <TableCell sx={{ textAlign: "center", py: 0.5 }}>
                              {row.id}
                            </TableCell>
                            <TableCell sx={{ textAlign: "left", py: 0.5 }}>
                              {row.event_name}
                            </TableCell>
                            <TableCell sx={{ textAlign: "left", py: 0.5 }}>
                              {row.event_desc}
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", py: 0.5 }}>
                              {new Date(row.created_at)
                                .toISOString()
                                .replace("T", " ")
                                .slice(0, 19)}
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", py: 0.5 }}>
                              {row.ip_address}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Box>
            </Box>
          </Grid>
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
