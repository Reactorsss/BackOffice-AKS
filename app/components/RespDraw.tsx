"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CryptoJS from "crypto-js";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Stack,
  useMediaQuery,
} from "@mui/material";
import { FaDatabase, FaSearch, FaUserCog, FaBook } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { BiNetworkChart } from "react-icons/bi";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";

const drawerWidth = 260;

interface Props {
  window?: () => Window;
}

export default function ResponsiveDrawer(props: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [userLevelName, setUserLevelName] = useState<string | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;

  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const encryptedUsername = searchParams.get("un") || "";
  const encryptedUserLevelName = searchParams.get("uslvln") || "";
  const userLevel = parseInt(searchParams.get("lvl") || "0");

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  useEffect(() => {
    if (encryptionKey) {
      const encryptedUsername = searchParams.get("un");
      const encryptedUserLevelName = searchParams.get("uslvln");

      if (encryptedUsername && encryptedUserLevelName) {
        try {
          const decryptedUsername = CryptoJS.AES.decrypt(
            encryptedUsername,
            encryptionKey
          ).toString(CryptoJS.enc.Utf8);
          const decryptedUserLevelName = CryptoJS.AES.decrypt(
            encryptedUserLevelName,
            encryptionKey
          ).toString(CryptoJS.enc.Utf8);

          setUsername(decryptedUsername);
          setUserLevelName(decryptedUserLevelName);
        } catch (error) {
          console.error("Decryption error:", error);
        }
      }
    }
  }, [encryptionKey, searchParams]);

  const allMenus = [
    {
      title: "Dashboard",
      icon: <MdDashboard size={24} />,
      href: `/dashboard?un=${encodeURIComponent(
        encryptedUsername
      )}&uslvln=${encodeURIComponent(encryptedUserLevelName)}&lvl=${userLevel}`,
    },
    {
      title: "Database Forms",
      icon: <FaDatabase size={22} />,
      href: `/db-forms?un=${encodeURIComponent(
        encryptedUsername
      )}&uslvln=${encodeURIComponent(encryptedUserLevelName)}&lvl=${userLevel}`,
    },
    {
      title: "Top Referrers",
      icon: <BiNetworkChart size={26} />,
      href: `/top-referrers?un=${encodeURIComponent(
        encryptedUsername
      )}&uslvln=${encodeURIComponent(encryptedUserLevelName)}&lvl=${userLevel}`,
    },
    {
      title: "Search Referrals",
      icon: <FaSearch size={23} />,
      href: `/searchReferrals?un=${encodeURIComponent(
        encryptedUsername
      )}&uslvln=${encodeURIComponent(encryptedUserLevelName)}&lvl=${userLevel}`,
    },
    {
      title: "Create Admin Account",
      icon: <FaUserCog size={23} />,
      href: `/create-admin?un=${encodeURIComponent(
        encryptedUsername
      )}&uslvln=${encodeURIComponent(encryptedUserLevelName)}&lvl=${userLevel}`,
    },
    {
      title: "Logs",
      icon: <FaBook size={23} />,
      href: `/logs?un=${encodeURIComponent(
        encryptedUsername
      )}&uslvln=${encodeURIComponent(encryptedUserLevelName)}&lvl=${userLevel}`,
    },
  ];

  // Filter menus based on user level
  const filteredMenus =
    userLevel === 1
      ? allMenus
      : allMenus.filter((menu) =>
          ["Dashboard", "Database Forms", "Search Referrals"].includes(
            menu.title
          )
        );

  const drawer = (isPermanent: boolean) => (
    <div>
      <Toolbar
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Stack
          spacing={1}
          sx={{
            pt: 2,
            pb: 2,
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              backgroundColor: "white",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 1,
            }}
          ></Box>

          <Typography
            variant="h6"
            sx={{
              letterSpacing: 2,
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            {userLevelName?.toLocaleUpperCase() || "Administrator"}
          </Typography>
        </Stack>
      </Toolbar>
      <List>
        {filteredMenus.map((menu, index) => {
          const isActive = pathname === menu.href;

          return (
            <ListItem key={index} disablePadding>
              <ListItemButton
                href={menu.href}
                sx={{
                  backgroundColor: isActive ? "#0470D2" : "inherit",
                  color: isActive ? "white" : "inherit",
                  "&:hover": {
                    backgroundColor: isActive ? "#0470D2" : "#e0e0e0",
                    color: isActive ? "white" : "inherit",
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? "white" : "inherit" }}>
                  {menu.icon}
                </ListItemIcon>
                <ListItemText primary={menu.title} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          left: 0,
          width: "100%",
          textAlign: "center",
        }}
      >
        <ListItemButton
          onClick={() => router.push("/")}
          sx={{
            display: "flex",
            justifyContent: "center",
            color: "white",
            "&:hover": {
              backgroundColor: "#0470D2",
              color: "white",
            },
          }}
        >
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <>
      {isMobile && !mobileOpen && (
        <IconButton
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            position: "absolute",
            top: 16,
            left: 16,
            color: "black",
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Box
        component="nav"
        sx={{
          width: { md: drawerWidth },
          flexShrink: { sm: 0 },
          background: "#11AEE5",
        }}
        aria-label="mailbox folders"
      >
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: "#11AEE5",
              color: "white",
            },
          }}
        >
          {drawer(false)}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: "#11AEE5",
              color: "white",
            },
          }}
          open
        >
          {drawer(true)}
        </Drawer>
      </Box>
    </>
  );
}
