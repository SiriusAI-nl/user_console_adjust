import './sidebar.css';
import React, { useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useNavigate } from 'react-router-dom';

import { FaPersonHalfDress } from "react-icons/fa6";
import { LuArrowDownToLine } from "react-icons/lu";
import { BiSolidBookmarkStar } from "react-icons/bi";
import { BorderRight } from '@mui/icons-material';



const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  backgroundColor:"#1F2937",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden', backgroundColor:"#1F2937",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start', // Align Menu Icon to the left
  padding: theme.spacing(0, 2),
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open'})(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  })
);

function Sidebar({ setMenuOpen, menuOpen, isBtn }) {
  const [activeItem, setActiveItem] = useState(null);
  const theme = useTheme();
  const navigate = useNavigate(); // Add navigate hook for routing

  const handleDrawerToggle = () => {
    setMenuOpen((prev) => !prev);
  };

  // Add route handling function
  const handleItemClick = (route) => {
    navigate(route);
    setActiveItem(route);
  };

  // Updated with route information
  const dataArr = [
    { name: "Agents", icon: "/images/user.png", route: "/home/agent" },
    { name: "Download", icon: "/images/download.png", route: "/home" },
    { name: "Save", icon: "/images/save.png", route: "/home" },
  ];

  return (
    <Box
      className={`${isBtn && "absolute"} z-[50] flex h-screen transition-all duration-300  ${menuOpen ? 'w-[240px]' : 'w-full'}`}
    >
      {/* Sidebar Drawer */}
      <Drawer variant="permanent" open={menuOpen}>
        <DrawerHeader style={{ paddingLeft: "10px" }}>
          <IconButton className=' mr-[20px]' onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />

        <List style={{ marginTop: "100px", width: menuOpen ? "100%" : "80%"}}>
          {dataArr.map(({ name, icon, route }) => (
            <ListItem key={name} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                className={`group list-item-button ${route === "/home/agent" ? "border-yellow-500 border" : ""}`}
                onClick={() => handleItemClick(route)}
                sx={{
                  minHeight: 48,
                  justifyContent: "center",
                  px: 2,
                  width: "89%",
                  marginInline: menuOpen ? '12px' : "10px",
                  borderRadius: '8px',
                  transition: 'background-color 0.3s ease, color 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#A854f7',
                    color: 'white',
                  },
                  ...(name === "Agents" && {
                    border: '1px solid #eab308', // Add yellow border for Agents
                  }),
                }}
              >
                <ListItemIcon
                  sx={{
                    border: "none",
                    minWidth: 0,
                    justifyContent: 'center',
                    mr: menuOpen ? "18px" : 'auto',
                    color: "white",
                    transition: 'color 0.3s ease',
                    '&:hover': {
                      color: 'purple',
                    },
                  }}
                >
                  <img
                    src={icon}
                    alt=""
                    className={`${menuOpen && "ml-[5px]"} w-[20px] h-[20px] transition duration-300 ease-in-out text-white`}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={name}
                  sx={{
                    opacity: menuOpen ? 1 : 0,
                    color: activeItem === route ? 'white' : 'inherit', // Change text color on active
                    transition: 'color 0.3s ease',
                    '&:hover': {
                      color: 'white', // Text color change on hover
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Box>
  );
}

export default Sidebar;