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
  SelectChangeEvent,
  Typography,
  Backdrop,
  Pagination,
} from "@mui/material";
import { Suspense, useEffect, useState } from "react";
import ResponsiveDrawer from "../components/RespDraw";
import Logo from "../assets/images/logo.png";
import Image from "next/image";
import { regions } from "psgc";
import Swal from "sweetalert2";
import axios from "axios";
import loadingState from "../assets/images/loadingState.gif";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import dayjs from "dayjs";

interface MappedRegion {
  designation: string;
  name: string;
  provinces: Array<{
    name: string;
    region: string;
  }>;
}

type DataGraphItem = {
  province_district: string;
  v_reg_complete: string;
  v_reg_partial: string;
  registered_voters_count: string;
  unregistered_voters_count: string;
};

type DataGraphItemCities = {
  city_municipality: string;
  v_reg_complete: string;
  v_reg_partial: string;
  registered_voters_count: string;
  unregistered_voters_count: string;
};

export default function Dashboard() {
  const defaultDateFrom = dayjs().startOf("day");
  const defaultDateTo = dayjs().endOf("day");

  const [selectedDateFrom, setSelectedDateFrom] = useState<string | null>(
    defaultDateFrom.format("YYYY-MM-DD HH:mm:ss")
  );
  const [selectedDateTo, setSelectedDateTo] = useState<string | null>(
    defaultDateTo.format("YYYY-MM-DD HH:mm:ss")
  );

  const [openBackDrop, setOpenBackdrop] = useState(false);
  const [selectedValue, setSelectedValue] = useState("0");
  const [selectedValueProvinces, setSelectedValueProvinces] =
    useState("Metro Manila");
  const [selectedValueMunicipality, setSelectedValueMunicipality] =
    useState("");
  const [regionsData, setRegionsData] = useState<MappedRegion[]>([]);
  const [provincesData, setProvincesData] = useState<any[]>([]);
  const [municipalitiesData, setMunicipalitiesData] = useState<any[]>([]);

  const [registrationTotal, setRegistrationTotal] = useState("");
  const [actualCount, setActualCount] = useState("");
  const [completeCount, setCompleteCount] = useState("");
  const [incompleteCount, setIncompleteCount] = useState("");

  const [dataGraph, setDataGraph] = useState<DataGraphItem[]>([]);
  const [dataGraphCities, setDataGraphCities] = useState<DataGraphItemCities[]>(
    []
  );

  const [selectedProvince, setSelectedProvince] = useState("0");

  const itemsPerPage = 4;
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPageCities = 4;
  const [currentPageCities, setCurrentPageCities] = useState(1);

  useEffect(() => {
    const fetchRegionsData = () => {
      const regionsList = regions.all();
      setRegionsData(regionsList);
    };
    fetchRegionsData();
  }, []);

  useEffect(() => {
    let valueToSearch = selectedValue;

    if (selectedValue === "NCR") {
      valueToSearch = "National Capital Region";
    }

    if (valueToSearch) {
      const selectedRegionData = regionsData.find(
        (region) => region.designation === valueToSearch
      );
      if (selectedRegionData && selectedRegionData.provinces) {
        setProvincesData(selectedRegionData.provinces);
      } else {
        setProvincesData([]);
      }
    }
  }, [selectedValue, regionsData]);

  const handleChangeRegion = (event: SelectChangeEvent<string>) => {
    const selected =
      event.target.value === "NCR"
        ? "National Capital Region"
        : event.target.value;
    setSelectedValue(selected);
    setSelectedValueProvinces("");
    setSelectedValueMunicipality("");
    setSelectedProvince("0");
  };

  const handleChangeProvince = (event: SelectChangeEvent<string>) => {
    const selected = event.target.value;

    setSelectedProvince(selected);
    setSelectedValueProvinces("");
    setSelectedValueMunicipality("");
  };

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

  const readDashboard1 = async () => {
    setOpenBackdrop(true);

    try {
      const res = await axios.post(`/api/admin-read-dashboard1`, {
        p_region: selectedValue,
        p_date_from: selectedDateFrom,
        p_date_to: selectedDateTo,
      });

      setRegistrationTotal(res.data.data.data[0].v_reg_total);
      setActualCount(res.data.data.data[0].v_reg_region);
      setCompleteCount(res.data.data.data[0].v_reg_complete);
      setIncompleteCount(res.data.data.data[0].v_reg_partial);
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

  const readDashboard2 = async () => {
    setOpenBackdrop(true);

    try {
      const res = await axios.post(`/api/admin-read-dashboard2`, {
        p_region: selectedValue,
        p_date_from: selectedDateFrom,
        p_date_to: selectedDateTo,
      });
      setDataGraph(res.data.data.data);
      setCurrentPage(1);
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

  const readDashboard2V2 = async () => {
    setOpenBackdrop(true);

    try {
      const res = await axios.post(`/api/admin-read-dashboard2-v2`, {
        p_province: selectedProvince,
        p_date_from: selectedDateFrom,
        p_date_to: selectedDateTo,
      });

      setDataGraphCities(res.data.data.data);
      setCurrentPageCities(1);
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
    readDashboard1();
  }, [selectedValue, selectedDateFrom, selectedDateTo]);

  useEffect(() => {
    readDashboard2();
  }, [selectedValue, selectedDateFrom, selectedDateTo]);

  useEffect(() => {
    readDashboard2V2();
  }, [selectedProvince, selectedDateFrom, selectedDateTo]);

  const totalPages = Math.ceil(dataGraph.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = dataGraph.slice(startIndex, startIndex + itemsPerPage);

  const filteredData = selectedValueMunicipality
    ? dataGraph.filter(
        (item) => item.province_district === selectedValueMunicipality
      )
    : paginatedData;

  const handlePageChange = (_event: any, value: any) => {
    setCurrentPage(value);
  };

  const totalPagesCities = Math.ceil(
    dataGraphCities.length / itemsPerPageCities
  );
  const startIndexCities = (currentPageCities - 1) * itemsPerPageCities;
  const paginatedDataCities = dataGraphCities.slice(
    startIndexCities,
    startIndexCities + itemsPerPageCities
  );

  const filteredDataCities = selectedValueMunicipality
    ? dataGraphCities.filter(
        (item) => item.city_municipality === selectedValueMunicipality
      )
    : paginatedDataCities;

  const handlePageChangeCities = (_event: any, value: any) => {
    setCurrentPageCities(value);
  };

  const handleChangeMunicipality = (event: SelectChangeEvent<string>) => {
    setSelectedValueMunicipality(event.target.value);
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
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Grid sx={{ height: "100%" }} container>
            <Image
              src={Logo}
              alt="Logo"
              style={{
                position: "absolute",
                top: ".5rem",
                right: ".5rem",
              }}
              width={100}
              height={100}
            />
            <Grid
              item
              xs={2.5}
              sx={{
                px: "1rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Stack
                spacing={3}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Paper
                  sx={{
                    width: "95%",
                    p: ".8rem",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "24px",
                    boxShadow: "0px 4px 12px rgba(128, 128, 128, 0.5)",
                  }}
                  elevation={5}
                >
                  <Stack
                    sx={{
                      color: "#91ABC3",
                    }}
                    spacing={0}
                  >
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: "bolder",
                        display: "flex",
                        justifyContent: "center",
                        letterSpacing: 2,
                      }}
                    >
                      {registrationTotal}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ textAlign: "center", px: "1.2rem" }}
                    >
                      Actual Registered Member Count
                    </Typography>
                  </Stack>
                </Paper>
                <Paper
                  sx={{
                    width: "95%",
                    p: ".8rem",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "24px",
                    boxShadow: "0px 4px 12px rgba(128, 128, 128, 0.5)",
                  }}
                  elevation={5}
                >
                  <Stack
                    sx={{
                      color: "#91ABC3",
                    }}
                    spacing={0}
                  >
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: "bolder",
                        display: "flex",
                        justifyContent: "center",
                        letterSpacing: 2,
                      }}
                    >
                      {actualCount}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ textAlign: "center", px: "3rem" }}
                    >
                      Actual Count in{" "}
                      {selectedValue === "0"
                        ? "N/A"
                        : selectedValue === "National Capital Region"
                        ? "NCR"
                        : selectedValue}
                    </Typography>
                  </Stack>
                </Paper>
                <Paper
                  sx={{
                    width: "95%",
                    p: ".8rem",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "24px",
                    boxShadow: "0px 4px 12px rgba(128, 128, 128, 0.5)",
                  }}
                  elevation={5}
                >
                  <Stack
                    sx={{
                      color: "#91ABC3",
                    }}
                    spacing={0}
                  >
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: "bolder",
                        display: "flex",
                        justifyContent: "center",
                        letterSpacing: 2,
                      }}
                    >
                      {completeCount === null ? "0" : completeCount}
                    </Typography>
                    <Typography variant="body1" sx={{ textAlign: "center" }}>
                      Complete Data Count
                    </Typography>
                  </Stack>
                </Paper>
                <Paper
                  sx={{
                    width: "95%",
                    p: ".8rem",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "24px",
                    boxShadow: "0px 4px 12px rgba(128, 128, 128, 0.5)",
                  }}
                  elevation={5}
                >
                  <Stack
                    sx={{
                      color: "#91ABC3",
                    }}
                    spacing={0}
                  >
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: "bolder",
                        display: "flex",
                        justifyContent: "center",
                        letterSpacing: 2,
                      }}
                    >
                      {incompleteCount === null ? "0" : incompleteCount}
                    </Typography>
                    <Typography variant="body1" sx={{ textAlign: "center" }}>
                      Incomplete Data Count
                    </Typography>
                  </Stack>
                </Paper>
              </Stack>
            </Grid>
            <Grid item xs={9.5}>
              <Box
                sx={{
                  height: "15%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  pl: "3rem",
                }}
              >
                <Grid container>
                  <Grid
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                    }}
                    item
                    xs={8}
                  >
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
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ display: "flex", justifyContent: "start" }}
                    >
                      <FormControl variant="outlined" sx={{ width: "170px" }}>
                        {!selectedValue && (
                          <InputLabel
                            sx={{
                              fontSize: "0.75rem",
                              px: "1rem",
                              top: "50%",
                              transform: "translateY(-50%)",
                              zIndex: 1,
                              color: "#91ABC3",
                            }}
                          >
                            Select Region
                          </InputLabel>
                        )}
                        <Select
                          value={selectedValue || ""}
                          onChange={handleChangeRegion}
                          sx={{
                            borderRadius: "20px",
                            backgroundColor: "#f5f5f5",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#ccc",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#999",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#007FFF",
                            },
                            fontSize: ".7rem",
                            height: "32px",
                            minHeight: "unset",
                            paddingTop: "12px",
                            paddingBottom: "12px",
                          }}
                        >
                          <MenuItem value={"0"}>All</MenuItem>
                          {regionsData.map((region) => (
                            <MenuItem
                              key={region.designation}
                              value={
                                region.designation === "NCR"
                                  ? "National Capital Region"
                                  : region.designation
                              }
                            >
                              {region.designation === "NCR"
                                ? "National Capital Region"
                                : region.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {selectedValue !== "0" ? (
                        <FormControl variant="outlined" sx={{ width: "170px" }}>
                          {!selectedProvince && (
                            <InputLabel
                              sx={{
                                fontSize: "0.75rem",
                                px: "1rem",
                                top: "50%",
                                transform: "translateY(-50%)",
                                zIndex: 1,
                                color: "#91ABC3",
                              }}
                            >
                              Province
                            </InputLabel>
                          )}
                          <Select
                            value={selectedProvince || ""}
                            onChange={handleChangeProvince}
                            sx={{
                              borderRadius: "20px",
                              backgroundColor: "#f5f5f5",
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#ccc",
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#999",
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
                                  borderColor: "#007FFF",
                                },
                              fontSize: ".7rem",
                              height: "32px",
                              minHeight: "unset",
                              paddingTop: "12px",
                              paddingBottom: "12px",
                            }}
                          >
                            <MenuItem value={"0"} disabled>
                              Select Province
                            </MenuItem>
                            {dataGraph.map((item) => (
                              <MenuItem
                                key={item.province_district}
                                value={item.province_district}
                              >
                                {item.province_district}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : (
                        <></>
                      )}
                      {selectedValue !== "0" ? (
                        <FormControl variant="outlined" sx={{ width: "170px" }}>
                          {selectedValueMunicipality === "" && (
                            <InputLabel
                              sx={{
                                fontSize: "0.75rem",
                                px: "1rem",
                                top: "50%",
                                transform: "translateY(-50%)",
                                zIndex: 1,
                                color: "#91ABC3",
                              }}
                            >
                              City / Municipality
                            </InputLabel>
                          )}
                          <Select
                            disabled={selectedProvince === "0"}
                            value={selectedValueMunicipality}
                            onChange={handleChangeMunicipality}
                            sx={{
                              borderRadius: "20px",
                              backgroundColor: "#f5f5f5",
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#ccc",
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#999",
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
                                  borderColor: "#007FFF",
                                },
                              fontSize: "0.75rem",
                              height: "32px",
                              minHeight: "unset",
                              paddingTop: "12px",
                              paddingBottom: "12px",
                            }}
                          >
                            <MenuItem value="">All</MenuItem>
                            {dataGraphCities.map((item) => (
                              <MenuItem
                                key={item.city_municipality}
                                value={item.city_municipality}
                              >
                                {item.city_municipality}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : (
                        <></>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={4}>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", ml: 1 }}
                    >
                      <Typography variant="body1">Legend</Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            backgroundColor: "#27AADD",
                            borderRadius: "4px",
                          }}
                        />
                        <Typography variant="body2">Fully Filled</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            backgroundColor: "#5CDBFF",
                            borderRadius: "4px",
                          }}
                        />
                        <Typography variant="body2">Partial Filled</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            backgroundColor: "#2BB673",
                            borderRadius: "4px",
                          }}
                        />
                        <Typography variant="body2">
                          Verified Registered Voter
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            backgroundColor: "#E75D2F",
                            borderRadius: "4px",
                          }}
                        />
                        <Typography variant="body2">
                          Unverified Registered Voter
                        </Typography>
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              <Box
                sx={{
                  height: "80%",
                  mt: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {selectedValue === "0" || selectedProvince === "0" ? (
                  <Paper
                    elevation={5}
                    sx={{
                      width: "90%",
                      height: "98%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        maxWidth: 1000,
                        margin: "auto",
                      }}
                    >
                      {filteredData.length === 0 ? (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="h4"
                            sx={{
                              color: "gray",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              textAlign: "center",
                            }}
                          >
                            NO DATA FETCHED IN THIS REGION OR IN THIS DATE RANGE
                          </Typography>
                        </Box>
                      ) : (
                        filteredData.map((item, index) => {
                          const maxValue = Math.max(
                            +item.v_reg_complete,
                            +item.v_reg_partial,
                            +item.registered_voters_count,
                            +item.unregistered_voters_count
                          );

                          return (
                            <Stack
                              key={item.province_district}
                              direction="row"
                              alignItems="center"
                              spacing={2}
                              sx={{
                                marginBottom: 2,
                                borderBottom:
                                  index !== filteredData.length - 1
                                    ? "2px solid black"
                                    : "none",
                                paddingBottom:
                                  index !== filteredData.length - 1 ? 1.5 : 0,
                              }}
                            >
                              <Typography
                                variant="h6"
                                sx={{ width: "20%", minWidth: 100 }}
                              >
                                {item.province_district}
                              </Typography>
                              <Box sx={{ width: "80%" }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: ".2rem",
                                    height: 20,
                                    width: `${
                                      (+item.v_reg_complete / maxValue) * 100
                                    }%`,
                                    bgcolor: "#27AADD",
                                    color: "#fff",
                                    borderRadius: 1,
                                    textAlign: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Typography variant="body2">
                                    {+item.v_reg_complete}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: ".2rem",
                                    height: 20,
                                    width: `${
                                      (+item.v_reg_partial / maxValue) * 100
                                    }%`,
                                    bgcolor: "#5CDBFF",
                                    color: "#fff",
                                    borderRadius: 1,
                                    textAlign: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Typography variant="body2">
                                    {+item.v_reg_partial}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: ".2rem",
                                    height: 20,
                                    width: `${
                                      (+item.registered_voters_count /
                                        maxValue) *
                                      100
                                    }%`,
                                    bgcolor: "#2BB673",
                                    color: "#fff",
                                    borderRadius: 1,
                                    textAlign: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Typography variant="body2">
                                    {+item.registered_voters_count}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: ".2rem",
                                    height: 20,
                                    width: `${
                                      (+item.unregistered_voters_count /
                                        maxValue) *
                                      100
                                    }%`,
                                    bgcolor: "#E75D2F",
                                    color: "#fff",
                                    borderRadius: 1,
                                    textAlign: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Typography variant="body2">
                                    {+item.unregistered_voters_count}
                                  </Typography>
                                </Box>
                              </Box>
                            </Stack>
                          );
                        })
                      )}
                    </Box>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="primary"
                      sx={{ mt: 2 }}
                    />
                  </Paper>
                ) : (
                  <Paper
                    elevation={5}
                    sx={{
                      width: "90%",
                      height: "98%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        maxWidth: 1000,
                        margin: "auto",
                      }}
                    >
                      {filteredDataCities.length === 0 ? (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="h4"
                            sx={{
                              color: "gray",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              textAlign: "center",
                            }}
                          >
                            NO DATA FETCHED IN THIS REGION OR IN THIS DATE RANGE
                          </Typography>
                        </Box>
                      ) : (
                        filteredDataCities.map((item, index) => {
                          const maxValue = Math.max(
                            +item.v_reg_complete,
                            +item.v_reg_partial,
                            +item.registered_voters_count,
                            +item.unregistered_voters_count
                          );

                          return (
                            <Stack
                              key={item.city_municipality}
                              direction="row"
                              alignItems="center"
                              spacing={2}
                              sx={{
                                marginBottom: 2,
                                borderBottom:
                                  index !== filteredDataCities.length - 1
                                    ? "2px solid black"
                                    : "none",
                                paddingBottom:
                                  index !== filteredDataCities.length - 1
                                    ? 1.5
                                    : 0,
                              }}
                            >
                              <Typography
                                variant="h6"
                                sx={{ width: "20%", minWidth: 100 }}
                              >
                                {item.city_municipality}
                              </Typography>
                              <Box sx={{ width: "80%" }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: ".2rem",
                                    height: 20,
                                    width: `${
                                      (+item.v_reg_complete / maxValue) * 100
                                    }%`,
                                    bgcolor: "#27AADD",
                                    color: "#fff",
                                    borderRadius: 1,
                                    textAlign: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Typography variant="body2">
                                    {+item.v_reg_complete}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: ".2rem",
                                    height: 20,
                                    width: `${
                                      (+item.v_reg_partial / maxValue) * 100
                                    }%`,
                                    bgcolor: "#5CDBFF",
                                    color: "#fff",
                                    borderRadius: 1,
                                    textAlign: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Typography variant="body2">
                                    {+item.v_reg_partial}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: ".2rem",
                                    height: 20,
                                    width: `${
                                      (+item.registered_voters_count /
                                        maxValue) *
                                      100
                                    }%`,
                                    bgcolor: "#2BB673",
                                    color: "#fff",
                                    borderRadius: 1,
                                    textAlign: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Typography variant="body2">
                                    {+item.registered_voters_count}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: ".2rem",
                                    height: 20,
                                    width: `${
                                      (+item.unregistered_voters_count /
                                        maxValue) *
                                      100
                                    }%`,
                                    bgcolor: "#E75D2F",
                                    color: "#fff",
                                    borderRadius: 1,
                                    textAlign: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Typography variant="body2">
                                    {+item.unregistered_voters_count}
                                  </Typography>
                                </Box>
                              </Box>
                            </Stack>
                          );
                        })
                      )}
                    </Box>
                    <Pagination
                      count={totalPagesCities}
                      page={currentPageCities}
                      onChange={handlePageChangeCities}
                      color="primary"
                      sx={{ mt: 2 }}
                    />
                  </Paper>
                )}
              </Box>
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
