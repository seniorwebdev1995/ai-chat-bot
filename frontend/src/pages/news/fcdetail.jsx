import {
  Box,
  Avatar,
  InputBase,
  IconButton,
  SvgIcon,
  Button,
  Modal,
} from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  MoreHoriz as MoreIcon,
  Mail as MailIcon,
} from '@mui/icons-material';

import { useState, useEffect, useRef } from 'react';
import instance from 'utils/axios';
import { useAuth } from 'hooks/useAuth';
import jwtDecode from 'jwt-decode';
import { setAuth } from 'utils/setAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import { ReactComponent as InviteIcon } from '../../assets/svg/invite_friend.svg';
import { ReactComponent as LeftArrowIcon } from '../../assets/svg/left_arrow.svg';
import { truncateString } from 'utils/global';

export default function FCDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [fcInfo, setFCInfo] = useState({
    mine: [],
    pending: [],
  });
  const { user } = useAuth();
  const [modalOpen, setOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [creatorName, setCreatorName] = useState(
    state?.info ? state.info[2] : ''
  );
  const [creator, setCreator] = useState(state?.info ? state.info[1] : '');

  const [crewText, setCrewText] = useState(state?.info ? state.info[0] : '');

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    if (inviteEmail !== '') alert('FC invitation has successfully sent !');
    // navigate('/news/fcdetail');
  };

  const getInitialInfo = () => {
    instance
      .post('/post/getFCInfo')
      .then((res) => {
        console.log('getInitialInfo called ---------', res);
        setFCInfo({
          mine: res.data.mine,
          pending: res.data.pending,
        });
      })
      .catch((err) => {
        if (err.response.status === 401) {
          navigate('/signin');
        }
        console.log('getPost error occured-----', err);
      });
  };
  useEffect(() => {
    setAuth(user);
    getInitialInfo();
  }, []);

  const goBack = () => {
    navigate('/news', {
      state: {
        info: [crewText, creator, creatorName],
      },
    });
  };

  const handleEmailChange = (e) => {
    setInviteEmail(e.target.value);
  };

  const sendInvite = () => {
    const email_pattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    const is_email = email_pattern.test(inviteEmail);
    if (is_email) {
      setEmailError('');
      instance
        .post('/email/sendEmail', {
          email: inviteEmail,
          flag: 2,
          user_name: creatorName,
          message: crewText,
        })
        .then((res) => {
          getInitialInfo();
        })
        .catch((err) => {
          if (err.response?.status === 401) {
            navigate('/signin');
          }
          console.log('invite user error occured', err);
        });

      instance
        .post('/post/inviteFC', { email: inviteEmail })
        .then((res) => {
          console.log('news invite---------', res.data);
          if (res.data === true) {
            setEmailError('');
            setInviteEmail('');
            handleClose();
          } else {
            setEmailError(res.data);
          }
        })
        .catch((err) => {
          console.log('error----', err);
          if (err.response.status === 401) {
            navigate('/signin');
          }
        });
    } else {
      setEmailError('Invalid Email');
    }
  };

  const removeFromFC = (id) => {
    instance
      .post('/post/removeUserFromFC', { userId: id })
      .then((res) => {
        console.log(res);
        getInitialInfo(0);
      })
      .catch((err) => {
        console.log('error----', err);
        if (err.response.status === 401) {
          navigate('/signin');
        }
      });
  };

  const removeNotification = (id) => {
    instance
      .post('/post/declineInvite', {
        pid: id,
      })
      .then((res) => {
        console.log(res);
        getInitialInfo();
      })
      .catch((err) => {
        console.log('error----', err);
        if (err.response.status === 401) {
          navigate('/signin');
        }
      });
  };

  const resendInvitation = (inviteEmail) => {
    instance
      .post('/post/inviteFC', { email: inviteEmail })
      .then((res) => {
        console.log('news invite---------', res.data);
      })
      .catch((err) => {
        console.log('error----', err);
        if (err.response.status === 401) {
          navigate('/signin');
        }
      });
  };

  return (
    <div className="w-full h-full bg-bg-primary">
      <div className="inline-flex w-full justify-between pt-8 px-9 bg-bg-primary items-center">
        <div>
          <button onClick={goBack}>
            <SvgIcon
              component={LeftArrowIcon}
              inheritViewBox
              sx={{ fontSize: '32px' }}
              className="text-bg-primary"
            ></SvgIcon>
          </button>
        </div>
        <p className="text-bg-white text-ti font-semibold !font-futura text-center">
          FC Detail
        </p>
        <div className="stroke-bg-white">
          <button onClick={handleOpen}>
            <SvgIcon
              component={InviteIcon}
              inheritViewBox
              sx={{ fontSize: '32px' }}
            ></SvgIcon>
          </button>
          <Modal
            open={modalOpen}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <div className="absolute top-1/3 left-2/4 width-20 shadow w-80 -ml-40 rounded-xl bg-bg-white p-4 shadow">
              {modalOpen === true ? (
                <div className="p-3">
                  <div className="flex mb-1">
                    <p className="text-lg">
                      Invite a friend to your Flight Crew
                    </p>
                    <button onClick={handleClose} className="flex">
                      <CloseIcon />
                    </button>
                  </div>
                  <div className="inline-flex w-full items-center justify-between mt-2">
                    <InputBase
                      value={inviteEmail}
                      sx={{ ml: 1, flex: 1, py: 1 }}
                      className="!bg-bg-gray_1 !ml-0 !mr-2 !rounded-md !px-2"
                      placeholder="Enter the email address"
                      onChange={handleEmailChange}
                    />
                    <IconButton
                      aria-label="send message"
                      onClick={sendInvite}
                      className="!bg-bg-primary !rounded-md"
                    >
                      <MailIcon className="text-bg-white" />
                    </IconButton>
                  </div>
                  <p className="text-bg-primary">
                    {emailError !== '' ? emailError : ''}
                  </p>
                </div>
              ) : (
                <></>
              )}
            </div>
          </Modal>
        </div>
      </div>
      <div className="mt-5 h-full rounded-t-3xl py-5 md:px-56 w-full bg-bg-white px-5 ">
        <div className="flex justify-start items-center mt-2 mb-4">
          <p
            className="text-base text-text-gray m-0 text-lg"
            color="primary.text.second"
          >
            Members
          </p>
        </div>
        {fcInfo.mine.length !== 0 &&
          fcInfo.mine[0].invited_users.map((item, idx) => (
            <div className="flex mb-4" key={idx}>
              <div className="flex justify-around items-start">
                <Avatar
                  src={`${process.env.REACT_APP_BACKEND_ORIGIN_URL}/avatar/${item.id}.png`}
                  sx={{ width: 50, height: 50 }}
                />
              </div>
              <div className="flex flex-col pl-2 w-full">
                <div className="flex">
                  <p className="text-ssm text-bg-primary">{item.full_name}</p>
                </div>
                <div
                  className="flex flex-col mt-2 px-2 w-full"
                  style={{ borderLeft: '2px solid #999999' }}
                >
                  <div className="flex justify-between items-center w-full mb-2">
                    <p className="text-sm mr-4 p-2">
                      {truncateString(item.email, 20)}
                    </p>
                    <div className="flex justify-end items-center">
                      <Button
                        onClick={(e) => removeFromFC(item.id)}
                        component="label"
                        variant="contained"
                        size="small"
                        className="bg-bg-primary sm:w-6/12 flex justify-center items-center"
                        sx={{
                          color: 'primary-main',
                          borderRadius: 4,
                          width: 1,
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                  {item.menuOpen && (
                    <div>
                      {item.emails.map((subscribeEmail, idx) => (
                        <div
                          className="flex justify-between items-center w-full mb-1"
                          key={idx}
                        >
                          <p className="text-sm mr-4 text-text-gray">
                            {subscribeEmail}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        <div className="flex justify-start items-center mt-5 mb-4">
          <p
            className="text-base text-text-gray m-0 text-lg"
            color="primary.text.second"
          >
            Peding invitations
          </p>
        </div>
        {fcInfo.pending.length !== 0 &&
          fcInfo.pending.map((item, idx) => (
            <div className="flex mb-4" key={idx}>
              <div className="flex justify-around items-start">
                <Avatar
                  src={`${process.env.REACT_APP_BACKEND_ORIGIN_URL}/avatar/${item.to}.png`}
                  sx={{ width: 50, height: 50 }}
                />
              </div>
              <div className="flex flex-col pl-2 w-full">
                <div className="flex">
                  <p className="text-ssm text-bg-primary">{item.full_name}</p>
                </div>
                <div
                  className="flex flex-col mt-2 px-2 w-full"
                  style={{ borderLeft: '2px solid #999999' }}
                >
                  <div className="flex justify-between items-center w-full mb-2">
                    <p className="text-sm mr-4 p-2">
                      {truncateString(item.to, 15)}
                    </p>
                    <div className="flex justify-end items-center">
                      <div className="mr-2">
                        <Button
                          onClick={(e) => resendInvitation(item.to)}
                          component="label"
                          variant="contained"
                          size="small"
                          className="bg-bg-primary sm:w-6/12 flex justify-center items-center"
                          color="button_gray"
                          sx={{
                            color: 'primary-main',
                            borderRadius: 4,
                            width: 1,
                          }}
                        >
                          Resend
                        </Button>
                      </div>
                      <Button
                        onClick={(e) => removeNotification(item.id)}
                        component="label"
                        variant="contained"
                        size="small"
                        className="bg-bg-primary sm:w-6/12 flex justify-center items-center "
                        sx={{
                          color: 'primary-main',
                          borderRadius: 4,
                          width: 1,
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
