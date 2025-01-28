"use client";

import {
  Box,
  CssBaseline,
  Backdrop,
  Grid,
  Paper,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
} from "@mui/material";
import { Suspense, useEffect, useState } from "react";
import ResponsiveDrawer from "../components/RespDraw";
import { FaUpload } from "react-icons/fa";
import Logo from "../assets/images/logo.png";
import Image from "next/image";
import axios from "axios";
import Swal from "sweetalert2";
import loadingState from "../assets/images/loadingState.gif";

type topReferrers = {
  id_no: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  direct_referrals: string;
  indirect_referrals: string;
  total_referrals: string;
};

export default function TopReferrers() {
  const [topreferrersData, setTopreferrersData] = useState<topReferrers[]>([]);
  const [openBackDrop, setOpenBackdrop] = useState(false);

  const sortedData = topreferrersData.sort(
    (a, b) => Number(b.total_referrals) - Number(a.total_referrals)
  );

  const topReferrers = async () => {
    setOpenBackdrop(true);

    try {
      const res = await axios.post(`/api/admin-top-referrers`, {
        p_filter: "0",
      });

      setTopreferrersData(res.data.data.data);
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

  const downloadCSV = () => {
    const headers = [
      "Direct Count",
      "In-Direct Count",
      "TotalCount",
      "ID No.",
      "First Name",
      "Middle Name",
      "Last Name",
    ];
    const rows = sortedData.map((row) => [
      row.direct_referrals,
      row.indirect_referrals,
      row.total_referrals,
      row.id_no,
      row.first_name,
      row.middle_name,
      row.last_name,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "top_referrers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    topReferrers();
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
            <Box
              sx={{
                color: "#91ABC3",
                pl: 5,
                pt: 3,
                fontWeight: "bolder",
                height: "10vh",
                width: "100%",
              }}
            >
              <Grid container>
                <Grid item xs={6}>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: "bolder", letterSpacing: 2 }}
                  >
                    Top Referrers
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={6}
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    pr: 20,
                  }}
                >
                  <Button
                    startIcon={<FaUpload />}
                    sx={{ height: "100%", color: "#91ABC3", p: 3 }}
                    onClick={downloadCSV}
                  >
                    Export Data
                  </Button>
                </Grid>
              </Grid>
            </Box>
            <Box
              sx={{
                height: "90vh",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <TableContainer component={Paper} sx={{ width: "95%" }}>
                <Table sx={{ borderBottom: "none" }}>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          borderRight: "1px solid rgba(224, 224, 224, 1)",
                          width: "10%",
                          fontSize: ".83rem",
                        }}
                      >
                        Direct Count
                      </TableCell>
                      <TableCell
                        sx={{
                          borderRight: "1px solid rgba(224, 224, 224, 1)",
                          width: "10%",
                          fontSize: ".83rem",
                        }}
                      >
                        Indirect Count
                      </TableCell>
                      <TableCell
                        sx={{
                          borderRight: "1px solid rgba(224, 224, 224, 1)",
                          width: "10%",
                          fontSize: ".83rem",
                        }}
                      >
                        Total Count
                      </TableCell>
                      <TableCell
                        sx={{
                          borderRight: "1px solid rgba(224, 224, 224, 1)",
                          width: "7%",
                        }}
                      >
                        ID No.
                      </TableCell>
                      <TableCell
                        sx={{
                          borderRight: "1px solid rgba(224, 224, 224, 1)",
                          width: "20%",
                        }}
                      >
                        First Name
                      </TableCell>
                      <TableCell
                        sx={{
                          borderRight: "1px solid rgba(224, 224, 224, 1)",
                          width: "20%",
                        }}
                      >
                        Middle Name
                      </TableCell>
                      <TableCell>Last Name</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedData.map((row, index) => (
                      <TableRow
                        key={row.id_no}
                        sx={{
                          borderBottom:
                            index === sortedData.length - 1
                              ? "none"
                              : "1px solid rgba(224, 224, 224, 1)",
                        }}
                      >
                        <TableCell
                          sx={{
                            borderRight: "1px solid rgba(224, 224, 224, 1)",
                            width: "10%",
                          }}
                        >
                          {row.direct_referrals}
                        </TableCell>
                        <TableCell
                          sx={{
                            borderRight: "1px solid rgba(224, 224, 224, 1)",
                            width: "10%",
                          }}
                        >
                          {row.indirect_referrals}
                        </TableCell>{" "}
                        <TableCell
                          sx={{
                            borderRight: "1px solid rgba(224, 224, 224, 1)",
                            width: "10%",
                          }}
                        >
                          {row.total_referrals}
                        </TableCell>
                        <TableCell
                          sx={{
                            borderRight: "1px solid rgba(224, 224, 224, 1)",
                          }}
                        >
                          {row.id_no}
                        </TableCell>
                        <TableCell
                          sx={{
                            borderRight: "1px solid rgba(224, 224, 224, 1)",
                          }}
                        >
                          {row.first_name}
                        </TableCell>
                        <TableCell
                          sx={{
                            borderRight: "1px solid rgba(224, 224, 224, 1)",
                          }}
                        >
                          {row.middle_name}
                        </TableCell>
                        <TableCell>{row.last_name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
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
