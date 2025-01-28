"use client";

import {
  Box,
  CssBaseline,
  Grid,
  Paper,
  Stack,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  InputAdornment,
  Button,
  Backdrop,
} from "@mui/material";
import { Suspense, useEffect, useState } from "react";
import ResponsiveDrawer from "../components/RespDraw";
import SearchIcon from "@mui/icons-material/Search";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import { FaUpload } from "react-icons/fa";
import Logo from "../assets/images/logo.png";
import Image from "next/image";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { FaCheck } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";
import dayjs from "dayjs";
import axios from "axios";
import Swal from "sweetalert2";
import loadingState from "../assets/images/loadingState.gif";
import { saveAs } from "file-saver";
import { useSearchParams } from "next/navigation";

type MemberData = {
  id: number;
  id_no: string;
  id_no_display: string;
  ext_id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  suffix: string;
  birth_date: string;
  mobile_no: string;
  email_address: string;
  is_active: string;
  activation_token: string;
  created_at: string;
  activated_at: string;
  region: string;
  province_district: string;
  city_municipality: string;
  barangay: string;
  formatted_address: string;
  otp: string;
  otp_validated_at: string;
  referrer_id_no: string;
  customer_level: number;
  photo_path_name: string;
  id_path_name: string;
  group_type: string;
  volunteer_type: string;
  is_registered_voter: number;
  emergency_contact_name: string;
  emergency_contact_no: string;
  passwordhash: string;
  chapter_type: string;
  is_support: number;
  aks_source: string;
  gender: string;
  biker_solo: string;
  el_presidente: string;
  rider_group: string;
  other_platforms: string;
  toda: string;
  poda: string;
  e_trike: string;
  e_bike: string;
  industry_worker: string;
  informal_worker: string;
  passenger: string;
  family_voters_count: number;
  precinct: string;
  student: string;
  is_direct: number;
  event_name: string;
  direct_referrals: string;
  indirect_referrals: string;
};

export default function DatabaseForms() {
  const defaultDateFrom = dayjs().startOf("day");
  const defaultDateTo = dayjs().endOf("day");
  const [openBackDrop, setOpenBackdrop] = useState(false);
  const [memberData, setMemberData] = useState<MemberData[]>([]);

  const [role, setRole] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [selectedDateFrom, setSelectedDateFrom] = useState<string | null>(
    defaultDateFrom.format("YYYY-MM-DD HH:mm:ss")
  );
  const [selectedDateTo, setSelectedDateTo] = useState<string | null>(
    defaultDateTo.format("YYYY-MM-DD HH:mm:ss")
  );

  const [searchQuery, setSearchQuery] = useState<string>("");

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

  const readDashboard3 = async () => {
    setOpenBackdrop(true);

    try {
      const res = await axios.post(`/api/admin-read-dashboard3`, {
        p_date_from: selectedDateFrom,
        p_date_to: selectedDateTo,
      });

      setMemberData(res.data.data.data);
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
    readDashboard3();
  }, [selectedDateFrom, selectedDateTo]);

  const filteredData = memberData.filter((row) => {
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

  const isSearchActive = searchQuery !== "";
  const cellStyle = isSearchActive
    ? { borderLeft: "none", borderRight: "none" }
    : {};

  const exportToCSV = () => {
    if (filteredData.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No Data",
        text: "There is no data to export.",
      });
      return;
    }
    const keys = Object.keys(filteredData[0]).filter(
      (key) => key !== "passwordhash"
    ) as (keyof MemberData)[];
    const headers = keys.join(",");
    const rows = filteredData.map((row) =>
      keys
        .map((key) =>
          row[key] !== null
            ? `"${row[key]?.toString().replace(/"/g, '""')}"`
            : ""
        )
        .join(",")
    );

    const csvContent = [headers, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(
      blob,
      `exported-member-data-${new Date().toISOString().split("T")[0]}.csv`
    );
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

  const exportToCSVSuperAdmin = () => {
    if (filteredData.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No Data",
        text: "There is no data to export.",
      });
      return;
    }

    const headers = Object.keys(filteredData[0]).join(",");

    const rows = filteredData.map((row) =>
      Object.values(row)
        .map((val) =>
          val !== null ? `"${val.toString().replace(/"/g, '""')}"` : ""
        )
        .join(",")
    );

    const csvContent = [headers, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(
      blob,
      `exported-member-data-${new Date().toISOString().split("T")[0]}.csv`
    );
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const value = sessionStorage.getItem("key");
      console.log(value); // Debugging
      setRole(value);
    }
  }, []);

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
            <Grid
              sx={{ color: "#91ABC3", pl: 5, pt: 3, fontWeight: "bolder" }}
              item
              xs={6}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: "bolder", letterSpacing: 2 }}
              >
                Database Form
              </Typography>
            </Grid>
            <Grid
              sx={{
                display: "flex",
              }}
              item
              xs={6}
            >
              <Stack
                spacing={2}
                direction="row"
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
              >
                {/* <Button
                  startIcon={<FaDownload />}
                  sx={{ height: "70%", color: "#91ABC3", p: 3 }}
                >
                  Import Data
                </Button> */}
                {role === "super admin" ? (
                  <Button
                    onClick={exportToCSVSuperAdmin}
                    startIcon={<FaUpload />}
                    sx={{ height: "70%", color: "#91ABC3", p: 3 }}
                  >
                    Export Data
                  </Button>
                ) : (
                  <Button
                    onClick={exportToCSV}
                    startIcon={<FaUpload />}
                    sx={{ height: "70%", color: "#91ABC3", p: 3 }}
                  >
                    Export Data
                  </Button>
                )}
              </Stack>
            </Grid>
            <Grid sx={{ px: 5 }} item xs={12}>
              <Paper elevation={5}>
                <Box
                  sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    backgroundColor: "white",
                    padding: 1,
                  }}
                >
                  <Grid container>
                    <Grid item xs={6}>
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{ display: "flex", justifyContent: "start", mb: 2 }}
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
                      </Stack>
                    </Grid>
                    <Grid
                      item
                      xs={6}
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
                <Paper
                  sx={{
                    overflowX: "auto",
                    overflowY: "auto",
                    maxHeight: "530px",
                    maxWidth: "auto",
                    minHeight: "530px",
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
                          <TableCell
                            onClick={() => handleSort("id_no_display")}
                          >
                            <Grid container>
                              <Grid xs={6}>
                                <Typography variant="caption">
                                  ID No.
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
                                {sortBy === "id_no_display" ? (
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
                          <TableCell onClick={() => handleSort("first_name")}>
                            <Stack spacing={2} direction="row">
                              <Typography variant="caption">
                                First Name
                              </Typography>
                              <Box>
                                {" "}
                                {sortBy === "first_name" ? (
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
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell onClick={() => handleSort("middle_name")}>
                            <Stack spacing={2} direction="row">
                              <Typography variant="caption">
                                Middle Name
                              </Typography>
                              <Box>
                                {" "}
                                {sortBy === "middle_name" ? (
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
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell onClick={() => handleSort("last_name")}>
                            <Stack spacing={2} direction="row">
                              <Typography variant="caption">
                                Last Name
                              </Typography>
                              <Box>
                                {" "}
                                {sortBy === "last_name" ? (
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
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>Suffix</TableCell>
                          <TableCell>Birth Date</TableCell>
                          <TableCell>Mobile No.</TableCell>

                          <TableCell
                            onClick={() => handleSort("email_address")}
                          >
                            <Grid container>
                              <Grid xs={6}>
                                <Typography variant="caption">
                                  Email Address
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
                                {sortBy === "email_address" ? (
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
                          <TableCell
                            onClick={() => handleSort("direct_referrals")}
                          >
                            <Stack spacing={2} direction="row">
                              <Typography variant="caption">
                                Direct Referrals
                              </Typography>
                              <Box>
                                {" "}
                                {sortBy === "direct_referrals" ? (
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
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell
                            onClick={() => handleSort("indirect_referrals")}
                          >
                            <Stack spacing={2} direction="row">
                              <Typography variant="caption">
                                Indirect Referrals
                              </Typography>
                              <Box>
                                {" "}
                                {sortBy === "indirect_referrals" ? (
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
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell onClick={() => handleSort("created_at")}>
                            <Grid container>
                              <Grid xs={6}>
                                <Typography variant="caption">
                                  Registered At
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
                          {/* <TableCell>Activated At</TableCell> */}
                          <TableCell onClick={() => handleSort("region")}>
                            <Grid container>
                              <Grid xs={6}>
                                <Typography variant="caption">
                                  Region
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
                                {sortBy === "region" ? (
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
                          <TableCell
                            onClick={() => handleSort("province_district")}
                          >
                            <Grid container>
                              <Grid xs={6}>
                                <Typography variant="caption">
                                  Province
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
                                {sortBy === "province_district" ? (
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
                          <TableCell
                            onClick={() => handleSort("city_municipality")}
                          >
                            <Grid container>
                              <Grid xs={6}>
                                <Typography variant="caption">
                                  Municipality
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
                                {sortBy === "city_municipality" ? (
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
                          <TableCell onClick={() => handleSort("barangay")}>
                            <Grid container>
                              <Grid xs={6}>
                                <Typography variant="caption">
                                  Barangay
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
                                {sortBy === "barangay" ? (
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
                          <TableCell
                            onClick={() => handleSort("formatted_address")}
                          >
                            <Grid container>
                              <Grid xs={6}>
                                <Typography variant="caption">
                                  Formatted Address
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
                                {sortBy === "formatted_address" ? (
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
                          {/* <TableCell>OTP Validated At</TableCell> */}
                          <TableCell
                            onClick={() => handleSort("referrer_id_no")}
                          >
                            <Stack spacing={2} direction="row">
                              <Typography variant="caption">
                                Referrer ID No
                              </Typography>
                              <Box>
                                {" "}
                                {sortBy === "referrer_id_no" ? (
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
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>Customer Level</TableCell>
                          <TableCell>Group Type</TableCell>
                          <TableCell>Volunteer Type</TableCell>
                          <TableCell>Registered Voter</TableCell>
                          <TableCell>Emergency Contact Name</TableCell>
                          <TableCell>Emergency Contact No.</TableCell>
                          <TableCell>Chapter Type</TableCell>
                          <TableCell>Support?</TableCell>
                          <TableCell>Aks Source</TableCell>

                          <TableCell>Gender</TableCell>
                          <TableCell>Biker</TableCell>
                          <TableCell>el presidente</TableCell>
                          <TableCell>rider group</TableCell>
                          <TableCell>Other platforms</TableCell>
                          <TableCell>Toda</TableCell>
                          <TableCell>Poda</TableCell>
                          <TableCell>E-trike</TableCell>
                          <TableCell>E-bike</TableCell>
                          <TableCell>Industrial Worker?</TableCell>

                          <TableCell>Informal Worker?</TableCell>
                          <TableCell>Passenger</TableCell>
                          <TableCell>Precint</TableCell>
                          <TableCell>Voters in family</TableCell>
                          <TableCell>Student</TableCell>
                          <TableCell>Direct</TableCell>
                          <TableCell>Event Name</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody
                        sx={{
                          verticalAlign: "top",
                        }}
                      >
                        {sortedData.length > 0 ? (
                          sortedData.map((row, index) => (
                            <TableRow key={row.id}>
                              <TableCell sx={cellStyle}>
                                {row.id_no_display}
                              </TableCell>
                              <TableCell sx={cellStyle}>
                                {row.first_name
                                  ? row.first_name.charAt(0).toUpperCase() +
                                    row.first_name.slice(1).toLowerCase()
                                  : ""}
                              </TableCell>
                              <TableCell sx={cellStyle}>
                                {row.middle_name
                                  ? row.middle_name.charAt(0).toUpperCase() +
                                    row.middle_name.slice(1).toLowerCase()
                                  : ""}
                              </TableCell>
                              <TableCell sx={cellStyle}>
                                {row.last_name
                                  ? row.last_name.charAt(0).toUpperCase() +
                                    row.last_name.slice(1).toLowerCase()
                                  : ""}
                              </TableCell>

                              <TableCell sx={cellStyle}>
                                {row.suffix === null ? "N/A" : row.suffix}
                              </TableCell>
                              <TableCell sx={cellStyle}>
                                {row.birth_date &&
                                new Date(row.birth_date).getTime() !== 0
                                  ? new Date(row.birth_date).toLocaleString(
                                      "en-US",
                                      {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      }
                                    )
                                  : "N/A"}
                              </TableCell>

                              <TableCell sx={cellStyle}>
                                {row.mobile_no}
                              </TableCell>

                              <TableCell sx={cellStyle}>
                                {row.email_address}
                              </TableCell>
                              <TableCell sx={cellStyle}>
                                {row.direct_referrals}
                              </TableCell>
                              <TableCell sx={cellStyle}>
                                {row.indirect_referrals}
                              </TableCell>
                              <TableCell sx={cellStyle}>
                                {new Date(row.created_at).toLocaleString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "numeric",
                                    second: "numeric",
                                    hour12: true,
                                    timeZone: "UTC",
                                  }
                                )}
                              </TableCell>

                              {/* <TableCell sx={cellStyle}>
                                {new Date(row.activated_at).getTime() === 0
                                  ? ""
                                  : new Date(row.activated_at).toLocaleString(
                                      "en-US",
                                      {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      }
                                    )}
                              </TableCell> */}
                              <TableCell sx={cellStyle}>{row.region}</TableCell>
                              <TableCell sx={cellStyle}>
                                {row.province_district}
                              </TableCell>
                              <TableCell sx={cellStyle}>
                                {row.city_municipality}
                              </TableCell>
                              <TableCell sx={cellStyle}>
                                {row.barangay}
                              </TableCell>
                              <TableCell sx={cellStyle}>
                                {row.formatted_address}
                              </TableCell>
                              {/* <TableCell sx={cellStyle}>
                                {new Date(row.otp_validated_at).getTime() === 0
                                  ? ""
                                  : new Date(
                                      row.otp_validated_at
                                    ).toLocaleString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                              </TableCell> */}

                              <TableCell sx={cellStyle}>
                                {row.referrer_id_no}
                              </TableCell>

                              <TableCell>
                                <Box
                                  sx={{
                                    width: "100%",
                                    display: "inline-block",
                                    px: 2,
                                    py: 1,
                                    borderRadius: "16px",
                                    textAlign: "center",
                                    color: "white",
                                    fontWeight: "bold",
                                    backgroundColor: (() => {
                                      switch (row.customer_level) {
                                        case 1:
                                          return "green";
                                        case 2:
                                          return "blue";
                                        case 3:
                                          return "orange";
                                        case 4:
                                          return "purple";
                                        case 5:
                                          return "yellow";
                                        default:
                                          return "grey";
                                      }
                                    })(),
                                  }}
                                >
                                  {row.customer_level}
                                </Box>
                              </TableCell>

                              <TableCell sx={cellStyle}>
                                {row.group_type}
                              </TableCell>
                              <TableCell sx={cellStyle}>
                                {row.volunteer_type}
                              </TableCell>
                              <TableCell sx={{ textAlign: "center" }}>
                                {row.is_registered_voter === 1 ? (
                                  <FaCheck style={{ color: "green" }} />
                                ) : (
                                  <RxCross1 style={{ color: "red" }} />
                                )}
                              </TableCell>
                              <TableCell sx={cellStyle}>
                                {row.emergency_contact_name}
                              </TableCell>
                              <TableCell sx={cellStyle}>
                                {row.emergency_contact_no}
                              </TableCell>
                              <TableCell sx={cellStyle}>
                                {row.chapter_type}
                              </TableCell>
                              <TableCell sx={{ textAlign: "center" }}>
                                {row.is_support === 1 ? (
                                  <FaCheck style={{ color: "green" }} />
                                ) : (
                                  <RxCross1 style={{ color: "red" }} />
                                )}
                              </TableCell>
                              <TableCell sx={cellStyle}>
                                {row.aks_source}
                              </TableCell>

                              <TableCell sx={cellStyle}>{row.gender}</TableCell>
                              <TableCell sx={cellStyle}>
                                {row.biker_solo}
                              </TableCell>
                              <TableCell sx={cellStyle}>
                                {row.el_presidente}
                              </TableCell>
                              <TableCell sx={cellStyle}>
                                {row.rider_group}
                              </TableCell>
                              <TableCell sx={cellStyle}>
                                {row.other_platforms}
                              </TableCell>
                              <TableCell sx={cellStyle}>{row.toda}</TableCell>
                              <TableCell sx={cellStyle}>{row.poda}</TableCell>
                              <TableCell sx={cellStyle}>
                                {row.e_trike}
                              </TableCell>
                              <TableCell sx={cellStyle}>{row.e_bike}</TableCell>

                              <TableCell sx={cellStyle}>
                                {row.industry_worker}
                              </TableCell>
                              <TableCell sx={cellStyle}>
                                {row.informal_worker}
                              </TableCell>
                              <TableCell sx={cellStyle}>
                                {row.passenger}
                              </TableCell>
                              <TableCell sx={cellStyle}>
                                {row.precinct}
                              </TableCell>
                              <TableCell sx={cellStyle}>
                                {row.family_voters_count}
                              </TableCell>
                              <TableCell sx={{ textAlign: "center" }}>
                                {row.student === "" ? (
                                  <FaCheck style={{ color: "green" }} />
                                ) : (
                                  <RxCross1 style={{ color: "red" }} />
                                )}
                              </TableCell>
                              <TableCell sx={{ textAlign: "center" }}>
                                {row.is_direct === 1 ? (
                                  <FaCheck style={{ color: "green" }} />
                                ) : (
                                  <RxCross1 style={{ color: "red" }} />
                                )}
                              </TableCell>
                              <TableCell sx={cellStyle}>
                                {row.event_name}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={42}
                              align="left"
                              sx={{ height: "100%" }}
                            >
                              <Typography
                                variant="h5"
                                sx={{ letterSpacing: 5, pl: 45 }}
                              >
                                No data fetched within this date range.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Paper>
            </Grid>
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
