import { useState, useEffect } from 'react';
import { SvgIcon, Avatar, Divider, AvatarGroup, Checkbox } from '@mui/material';
import { useAuth } from 'hooks/useAuth';
import { ReactComponent as LeftArrowIcon } from '../../../assets/svg/left_arrow.svg';
import { useForm } from 'react-hook-form';
import { KeyboardArrowRight as KeyboardArrowRightIcon } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { setAuth } from 'utils/setAuth';
import instance from 'utils/axios';
import jwtDecode from 'jwt-decode';

export default function PostSelect() {
  const { user } = useAuth();
  const { state } = useLocation();
  const [pageType, setPageType] = useState(state?.id ? 1 : 0);
  const [templateId, setTemplateId] = useState(state?.id ? state.id : '');
  const [templateName, setTemplateName] = useState(
    state?.templateName ? state.templateName : ''
  );
  const [urls, seturls] = useState(state?.urls ? state.urls : '');
  const [news, setnews] = useState(state?.news ? state.news : '');
  const [selectedDate, setselectedDate] = useState(
    state?.selectedDate ? state.selectedDate : ''
  );
  const [content, setcontent] = useState(state?.content ? state.content : '');
  const [templateInfo, setTemplateInfo] = useState({});
  const [messages, setMessages] = useState([]);
  const [originMessages, setOriginMessages] = useState(
    state?.messages ? state.messages : []
  );
  const navigate = useNavigate();

  const getInitialMessages = () => {
    instance
      .post('/post/getPosts')
      .then((res) => {
        const sortedMsgs = res.data.slice().sort((a, b) => {
          return b.comments.length - a.comments.length;
        });
        const updatedmsgs = sortedMsgs.map((msg) => ({
          ...msg,
          selected: false,
        }));
        if (pageType == 1)
          instance
            .post('/newsletter/getTemplatesInfo', { id: templateId })
            .then((res) => {
              setTemplateInfo(res.data[0]);
              console.log(res.data);
              updatedmsgs.forEach((msg) => {
                res.data[0].messages.forEach((obj) => {
                  if (obj.id == msg.id) msg.selected = true;
                });
              });
              setMessages(updatedmsgs);
            })
            .catch((err) => {
              console.log(err.response);
              if (err.response.status === 401) {
                navigate('/signin');
              }
              console.log('get user info error----', err);
            });
        else {
          updatedmsgs.forEach((msg) => {
            originMessages.forEach((obj) => {
              if (obj.id == msg.id) msg.selected = true;
            });
          });
          setMessages(updatedmsgs);
        }
      })
      .catch((err) => {
        if (err.response.status === 401) {
          navigate('/signin');
        }
        console.log('getPost error occured-----', err);
      });
  };

  useEffect(() => {
    getInitialMessages();
  }, []);

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm();

  const handleCheck = (i) => {
    const newMsgs = [...messages];
    newMsgs[i].selected = !newMsgs[i].selected;
    setMessages(newMsgs);
  };

  const back = () => {
    if (pageType == 1) {
      const newTemplateInfo = {
        messages: messages
          .filter((item) => item.selected == true)
          .map((item) => item.id),
      };
      console.log(newTemplateInfo);
      instance
        .post('/newsletter/updateTemplate', {
          _id: templateInfo.id,
          newTemplateInfo,
        })
        .then((res) => {
          navigate('/admin/news/create', {
            state: { id: templateInfo.id },
          });
        });
    } else {
      navigate('/admin/news/create', {
        state: {
          templateName,
          urls,
          news,
          selectedDate,
          content,
          messages: messages.filter((item) => item.selected == true),
        },
      });
    }
  };

  return (
    <div className="w-full h-full bg-bg-primary">
      <div className="inline-flex w-full justify-between pt-8 px-9 items-center">
        <div>
          <div
            onClick={() => {
              back();
            }}
            className="text-bg-primary"
          >
            <SvgIcon
              component={LeftArrowIcon}
              inheritViewBox
              sx={{ fontSize: '32px' }}
            ></SvgIcon>
          </div>
        </div>
        <p className="text-bg-white text-ti font-semibold !font-futura text-center">
          Select Posts
        </p>

        <div className="flex justify-center items-center mb-2"></div>
      </div>

      <div className="mt-5 h-full rounded-t-3xl py-5 px-9 md:px-56 w-full bg-bg-white p-4 ">
        {messages.map((item, i) => {
          const [date, time] = item.createdAt.split('T');
          const [, month, day] = date.split('-');
          const [hour, minute] = time.split('.')[0].split(':');
          const item_userID = item?.userId[0]?.id;
          return (
            <div
              key={i}
              className="inline-flex w-full mt-5"
              onClick={() => handleCheck(i)}
            >
              <Avatar
                src={`${process.env.REACT_APP_BACKEND_ORIGIN_URL}/avatar/${item_userID}.png`}
                sx={{ width: 50, height: 50 }}
              />
              <div className="flex flex-col p-3 bg-bg-gray w-full ml-3 rounded-xl mr-8">
                <p className="my-2 text-bg-primary text-ssm">
                  {item.userId[0]?.user_name
                    ? item.userId[0].user_name
                    : 'Deleted User'}
                </p>
                <p className="text-base">{item.content}</p>
                <p className="text-text-gray text-end">{`${hour}:${minute} | ${month}/${day}`}</p>
                <Divider variant="middle" className="!my-2" />
                <button className="flex justify-between items-center ">
                  <div className="flex items-center">
                    <div>
                      {item.comments.length > 0 ? (
                        <>
                          <AvatarGroup max={3}>
                            {item.comments.map((item, i) => {
                              if (i <= 2) {
                                return (
                                  <Avatar
                                    key={i}
                                    className="!w-[20px] !h-[20px]"
                                    src={`${process.env.REACT_APP_BACKEND_ORIGIN_URL}/avatar/${item.userId}.png`}
                                  ></Avatar>
                                );
                              } else {
                                return false;
                              }
                            })}
                          </AvatarGroup>
                        </>
                      ) : (
                        ''
                      )}
                    </div>
                    <p
                      className="text-ssm text-bg-primary ml-2"
                      id={item.id}
                    >{`${item.comments.length} comments*`}</p>
                  </div>
                  <KeyboardArrowRightIcon className="!text-lg text-bg-primary" />
                </button>
              </div>
              <Checkbox key={i} checked={item.selected} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
