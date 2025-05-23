import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from 'hooks/useAuth';
import jwtDecode from 'jwt-decode';
import {
  Sort as SortIcon,
  Clear as ClearIcon,
  Logout,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Typography,
  SvgIcon,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as HomeIcon } from '../../assets/svg/home.svg';
import { ReactComponent as NewsIcon } from '../../assets/svg/news.svg';
import { ReactComponent as ResourcesIcon } from '../../assets/svg/resources.svg';
import { ReactComponent as DashboardIcon } from '../../assets/svg/dashboard.svg';
import { ReactComponent as LearningIcon } from '../../assets/svg/learning.svg';
import { ReactComponent as SupportIcon } from '../../assets/svg/support.svg';
import { ReactComponent as SettingIcon } from '../../assets/svg/setting.svg';

const routes = [
  {
    to: '/',
    content: 'Home',
    icon: (
      <SvgIcon
        component={HomeIcon}
        inheritViewBox
        sx={{ fontSize: '24px', backgroundColor: 'white' }}
      ></SvgIcon>
    ),
  },
  {
    to: '/news',
    content: 'Hangar',
    icon: (
      <SvgIcon
        component={NewsIcon}
        inheritViewBox
        sx={{ fontSize: '24px' }}
      ></SvgIcon>
    ),
  },
  {
    to: '/working',
    content: 'Resources',
    icon: (
      <SvgIcon
        component={ResourcesIcon}
        inheritViewBox
        sx={{ fontSize: '24px' }}
      ></SvgIcon>
    ),
  },
  {
    to: '/working',
    content: 'Dashboard',
    icon: (
      <SvgIcon
        component={DashboardIcon}
        inheritViewBox
        sx={{ fontSize: '24px' }}
      ></SvgIcon>
    ),
  },

  {
    to: '/working',
    content: 'Exam Support',
    icon: (
      <SvgIcon
        component={SupportIcon}
        inheritViewBox
        sx={{ fontSize: '24px' }}
      ></SvgIcon>
    ),
  },

  {
    to: '/',
    content: 'Learning Module',
    icon: (
      <SvgIcon
        component={LearningIcon}
        inheritViewBox
        sx={{ fontSize: '24px' }}
      ></SvgIcon>
    ),
  },
];

export const Sidenav = (props) => {
  const { user, logout } = useAuth();
  const [open, setopen] = useState(true);
  // Function to decode user ID from the token
  const decodeUserId = (token) => {
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken;
    } catch (error) {
      console.error('Error decoding user ID: -----------', error);
      // Handle invalid token error, e.g., log out the user
      logout();
      return null;
    }
  };
  const uid = user && user != 'null' ? decodeUserId(user).id : null;

  const navigate = useNavigate();
  const [allroutes, setAllroutes] = useState(
    user && user != 'null'
      ? decodeUserId(user).role.includes('admin')
        ? [
            ...routes,
            {
              to: '/admin/news',
              content: 'Admin Panel',
              icon: (
                <SvgIcon
                  component={SettingIcon}
                  inheritViewBox
                  sx={{ fontSize: '24px' }}
                ></SvgIcon>
              ),
            },
          ]
        : routes
      : routes
  );

  const toggleOpen = () => {
    setopen(!open);
  };

  const goProfilePage = () => {
    navigate('/profile');
  };
  return (
    <>
      <button
        className="absolute top-[36px] left-[36px] z-[5000] text-bg-primary"
        onClick={toggleOpen}
      >
        {open ? (
          <SortIcon sx={{ color: props.color, fontSize: '32px' }} />
        ) : (
          <ClearIcon sx={{ color: 'primary.text.second', fontSize: '32px' }} />
        )}
      </button>
      <Collapse
        orientation="horizontal"
        in={!open}
        sx={{
          backgroundColor: 'white',
          position: 'absolute',
          top: '0px',
          left: '0px',
          zIndex: 'modal',
          height: 1,
          borderTopRightRadius: 12,
          borderBottomRightRadius: 12,
          overflowY: 'auto',
        }}
      >
        <Box
          sx={{
            mt: 10,
            mx: 2,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {uid === null ? (
            <Avatar
              sx={{ width: 60, height: 60, mb: 2, ml: '14px', mt: '35px' }}
            />
          ) : (
            <Avatar
              onClick={goProfilePage}
              src={`${process.env.REACT_APP_BACKEND_ORIGIN_URL}/avatar/${uid}.png`}
              sx={{ width: 60, height: 60, mb: 2, ml: '14px', mt: '35px' }}
            />
          )}
          {allroutes.map((item, index) => {
            return (
              <div key={index} className="inline-flex my-4 ml-3 mr-4">
                {item.icon}
                <NavLink key={index} to={item.to} className="pl-1 ">
                  <Typography>{item.content}</Typography>
                </NavLink>
              </div>
            );
          })}
        </Box>
      </Collapse>
      {open ? (
        <></>
      ) : (
        <Box
          onClick={toggleOpen}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 1040,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#000',
            opacity: '0.5',
          }}
        ></Box>
      )}
    </>
  );
};
