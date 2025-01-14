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
import { FaPersonHalfDress } from "react-icons/fa6";
import { LuArrowDownToLine } from "react-icons/lu";
import { BiSolidBookmarkStar } from "react-icons/bi";



const drawerWidth = 300;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
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

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'menuOpen' })(
  ({ theme, menuOpen }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(menuOpen && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!menuOpen && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  })
);

function Sidebar({setMenuOpen,menuOpen}) {
  const [activeItem, setActiveItem] = useState(null);
  const theme = useTheme();
  

  const handleDrawerToggle = () => {
    setMenuOpen((prev) => !prev);
  };

  const dataArr = [
    { name: "Agents", icon: <FaPersonHalfDress />},
    { name: "Download", icon: <LuArrowDownToLine /> },
    { name: "Save", icon: <BiSolidBookmarkStar /> },
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar Drawer */}
      <Drawer variant="permanent" menuOpen={menuOpen}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
       
<List>
  {dataArr.map(({ name, icon }) => (
    <ListItem key={name} disablePadding sx={{ display: 'block' }}>
      <ListItemButton
        className={`list-item-button ${activeItem === name ? 'active' : ''}`}
        sx={{
          minHeight: 48,
          justifyContent: menuOpen ? 'initial' : 'center',
          px: 0.5,
          width: '80%',
          margin: '0 20px 0 10px',
          borderRadius: '8px',
          transition: 'background-color 0.3s ease, color 0.3s ease',
          backgroundColor: activeItem === name ? '#340061' : 'transparent',
          '&:hover': {
            backgroundColor: '#340061',
            color:'white',
          },
        }}
        onClick={() => setActiveItem(name)}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            justifyContent: 'center',
            mr: menuOpen ? 3 : 'auto',
            color: activeItem === name ? 'white' : 'inherit', // Change icon color on active
            transition: 'color 0.3s ease',
            '&:hover': {
              color: 'white', // Icon color change on hover
            },
          }}
        >
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={name}
          sx={{
            opacity: menuOpen ? 1 : 0,
            color: activeItem === name ? 'white' : 'inherit', // Change text color on active
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
