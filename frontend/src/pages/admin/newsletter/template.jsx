import { useState, useEffect } from 'react';
import {
  SvgIcon,
  Button,
  InputBase,
  Avatar,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import { useAuth } from 'hooks/useAuth';
import { Link } from 'react-router-dom';
import { ReactComponent as LeftArrowIcon } from '../../../assets/svg/left_arrow.svg';
import { useForm } from 'react-hook-form';
import {
  Close as CloseIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import instance from 'utils/axios';
import jwtDecode from 'jwt-decode';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { truncateString } from 'utils/global';

export default function Template() {
  const { state } = useLocation();
  const [pageType, setPageType] = useState(state?.id ? 1 : 0);
  const [templateId, setTemplateId] = useState(state?.id ? state.id : '');
  const [templateInfo, setTemplateInfo] = useState({});
  const [templateName, setTemplateName] = useState(
    state?.templateName ? state?.templateName : 'My Template'
  );
  const [messages, setMessages] = useState(
    state?.messages ? state.messages : []
  );
  const [news, setNews] = useState(state?.news ? state?.news : []);
  const [selectedDate, setSelectedDate] = useState(
    state?.selectedDate ? state?.selectedDate : 1
  );
  const [content, setContent] = useState(state?.content ? state.content : '');
  const [urls, setUrls] = useState(state?.urls ? state.urls : '');
  const [date, setDate] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    switch (e.target.name) {
      case 'urls':
        setUrls(e.target.value);
        break;
      case 'selectedDate':
        console.log(e.target.value);
        setSelectedDate(e.target.value);
        break;
      case 'content':
        setContent(e.target.value);
        break;
      case 'templateName':
        setTemplateName(e.target.value);
        break;
      case 'date':
        setDate(e.target.value);
        break;
    }
  };

  useEffect(() => {
    if (pageType == 1)
      instance
        .post('/newsletter/getTemplatesInfo', { id: templateId })
        .then((res) => {
          setTemplateInfo(res.data[0]);
          setUrls(res.data[0].urls.join(', ').replace(/\s{2,}/g, ' '));
          setContent(res.data[0].content);
          setMessages((prevState) => res.data[0].messages);
          setNews((prevState) => res.data[0].news);
          setTemplateName(res.data[0].name);
          if (res.data[0].date.startsWith('4')) {
            setSelectedDate('4');
            setDate(res.data[0].date.split(',')[1]);
          } else {
            setSelectedDate(res.data[0].date);
          }
          console.log(res.data[0].messages);
          console.log(res);
        })
        .catch((err) => {
          console.log('/newsletter/getTemplatesInfo error----', err);
          if (err.response.status === 401) {
            navigate('/signin');
          }
        });
  }, []);

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm();

  const handleClick = (e) => {
    console.log('click ------------');
    console.log(e.target.name);
    switch (e.target.name) {
      case 'button':
        if (selectedDate == 4 && !isValidDayOfMonth(date)) {
          alert('Please input date between 1 and 31');
          return;
        }

        if (pageType == 0) {
          console.log(messages);
          const newTemplateInfo = {
            name: templateName,
            urls: urls.length == 0 ? [] : urls.replace(/\s/g, '').split(','),
            messages: messages.map((item) => item.id),
            news,
            content: content,
            date:
              selectedDate == '4' ? selectedDate + ',' + date : selectedDate,
          };
          instance
            .post('/newsletter/updateTemplate', { newTemplateInfo })
            .then((res) => {
              console.log(res);

              navigate('/admin/news');
            })
            .catch((err) => {
              console.log('/newsletter/updateTemplate error ', err);
              if (err.response.status === 401) {
                navigate('/signin');
              }
            });
        } else if (pageType == 1) {
          const newTemplateInfo = {
            name: templateName,
            urls: urls.length == 0 ? [] : urls.replace(/\s/g, '').split(','),
            messages: messages.map((item) => item.id),
            content: content,
            date:
              selectedDate == '4' ? selectedDate + ',' + date : selectedDate,
          };
          instance
            .post('/newsletter/updateTemplate', {
              _id: templateInfo.id,
              newTemplateInfo,
            })
            .then((res) => {
              console.log(res);
              navigate('/admin/news');
            })
            .catch((err) => {
              console.log('/newsletter/updateTemplate error ', err);
              if (err.response.status === 401) {
                navigate('/signin');
              }
            });
        }
        break;
      case 'template':
        console.log('template clicked ------');
        break;
      default:
        break;
    }
  };

  const updateTemplateAndGoPost = () => {
    const newTemplateInfo = {
      name: templateName,
      urls: urls.length == 0 ? [] : urls.replace(/\s/g, '').split(','),
      messages: messages.map((item) => item.id),
      content: content,
      date: selectedDate == '4' ? selectedDate + ',' + date : selectedDate,
    };
    instance
      .post('/newsletter/updateTemplate', {
        _id: templateInfo.id,
        newTemplateInfo,
      })
      .then((res) => {
        console.log(res);
        navigate('/admin/news/postselect', {
          state: { id: templateInfo.id },
        });
      })
      .catch((err) => {
        console.log('/newsletter/updateTemplate error ', err);
        if (err.response.status === 401) {
          navigate('/signin');
        }
      });
  };

  const removeTemplate = (e) => {
    if (window.confirm('Are you sure to delete this Template ?')) {
      instance
        .post('/newsletter/removeTemplate', {
          id: templateInfo.id,
        })
        .then((res) => {
          console.log(res);
          navigate('/admin/news');
        })
        .catch((err) => {
          console.log('/newsletter/removeTemplate error ', err);
          if (err.response.status === 401) {
            navigate('/signin');
          }
        });
    }
  };

  const handleRemoveMsgClick = (idx) => {
    console.log(idx);
    const newMessages = messages.filter((item, index) => {
      if (index != idx) return item;
    });
    setMessages(newMessages);
    if (pageType == 1) {
      const newTemplateInfo = {
        messages: newMessages.map((item) => item.id),
      };
      instance
        .post('/newsletter/updateTemplate', {
          _id: templateInfo.id,
          newTemplateInfo,
        })
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log('/newsletter/updateTemplate error ', err);
          if (err.response.status === 401) {
            navigate('/signin');
          }
        });
    }
  };

  const handleRemoveNewsClick = (idx) => {
    console.log(idx);
    const newNews = news.filter((item, index) => {
      if (index != idx) return item;
    });
    setNews(newNews);
    if (pageType == 1) {
      const newTemplateInfo = {
        news: newNews,
      };
      instance
        .post('/newsletter/updateTemplate', {
          _id: templateInfo.id,
          newTemplateInfo,
        })
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log('/newsletter/updateTemplate error ', err);
          if (err.response.status === 401) {
            navigate('/signin');
          }
        });
    }
  };

  function isValidDayOfMonth(inputString) {
    // Convert the input string to a number
    const day = parseInt(inputString, 10);
    if (isNaN(inputString)) {
      return false;
    }
    console.log(day);
    // Check if the number is between 1 and 31
    return day >= 1 && day <= 31;
  }

  return (
    <div className="w-full h-full bg-bg-primary">
      <div className="inline-flex w-full justify-between pt-8 px-9 items-center">
        <div>
          <Link to={{ pathname: '/admin/news' }} className="text-bg-primary">
            <SvgIcon
              component={LeftArrowIcon}
              inheritViewBox
              sx={{ fontSize: '32px' }}
            ></SvgIcon>
          </Link>
        </div>
        <p className="text-bg-white text-ti font-semibold !font-futura text-center">
          {templateName}
        </p>

        <div className="flex justify-center items-center">
          {pageType == 1 ? (
            <DeleteIcon
              color="bg_white"
              fontSize="large"
              name="template"
              onClick={removeTemplate}
            />
          ) : (
            <></>
          )}
        </div>
      </div>

      <div className="mt-5 h-full rounded-t-3xl py-5 px-9 md:px-56 w-full bg-bg-white p-4 ">
        <div className="flex justify-between items-center mt-5">
          <div className="input-field mb-4 text-bg-primary w-full">
            <p className="text-text-gray my-2">Template Name</p>
            <InputBase
              value={templateName}
              name="templateName"
              onChange={handleChange}
              sx={{
                borderRadius: '15px',
                flex: 1,
                py: 2,
                px: 2,
                backgroundColor: 'primary.text.input_bg',
                width: 1,
              }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-2">
          <div className="input-field mb-4 text-bg-primary w-full">
            <p className="text-text-gray my-2">
              URLs for scrapping News seperated with a ',' ( comma )
            </p>
            <InputBase
              value={urls}
              name="urls"
              onChange={handleChange}
              sx={{
                borderRadius: '15px',
                flex: 1,
                py: 2,
                px: 2,
                backgroundColor: 'primary.text.input_bg',
                width: 1,
              }}
            />
          </div>
        </div>

        <div className="">
          <p className="text-text-gray ">Scrapped News</p>
          <div className="flex overflow-x-auto">
            <div className="flex space-x-4 py-4">
              {news.map((item, idx) => {
                return (
                  <div
                    className="flex flex-col p-3 bg-bg-gray  rounded-xl w-[250px] relative"
                    key={idx}
                  >
                    <div className="absolute flex top-0 right-0 h-[26px] w-[26px] border-bg-primary items-center justify-center border-bg-primary border-2 rounded-[10px] bg-bg-parentprimary">
                      <CloseIcon
                        className="text-bg-primary h-[10px] w-[10px]"
                        onClick={(e) => handleRemoveNewsClick(idx)}
                      />
                    </div>
                    <div className="flex items-center justify-start">
                      <p className="my-2 text-bg-primary">
                        {truncateString(item.title)}
                      </p>
                    </div>
                    <p className="text-base  text-ssm">
                      {truncateString(item.description, 35)}
                    </p>
                    <p className="text-text-gray text-end">{item.date}</p>
                    <Divider variant="middle" className="!my-2" />
                    <button className="flex justify-between items-center ">
                      <div className="flex items-center">
                        <div>
                          <p className="text-ssm text-bg-primary ml-2">
                            {truncateString(item.url, 30)}
                          </p>
                        </div>
                      </div>
                      <KeyboardArrowRightIcon className="!text-lg text-bg-primary" />
                    </button>
                  </div>
                );
              })}
              <button
                className="rounded border-2 border-dashed border-gray-100 flex justify-center items-center py-12 w-[100px] "
                onClick={() => {
                  if (urls.length == 0) {
                    alert('Please input URLs');
                    return;
                  }
                  pageType == 1
                    ? navigate('/admin/news/newsselect', {
                        state: {
                          id: templateInfo.id,
                          urls: urls,
                        },
                      })
                    : navigate('/admin/news/newsselect', {
                        state: {
                          templateName,
                          news,
                          selectedDate,
                          messages,
                          content,
                          urls,
                        },
                      });
                }}
              >
                <AddIcon className="text-text-gray !text-ti" />
              </button>
            </div>
          </div>
        </div>

        <div className="input-field mb-2">
          <p className="text-text-gray my-2">News Letter Scheduling</p>
          <Select
            className="w-full"
            name="selectedDate"
            value={selectedDate}
            onChange={handleChange}
          >
            <MenuItem value={1}>
              <span>Every</span>
              <span className="text-text-red p-2">1st</span>
              <span>day of each month</span>
            </MenuItem>
            <MenuItem value={2}>
              <span>Every</span>
              <span className="text-text-red p-2">Monday</span>
              <span>of each week</span>
            </MenuItem>
            <MenuItem value={3}>
              <span>Every</span>
              <span className="text-text-red p-2">Last</span>
              <span>day of each month</span>
            </MenuItem>
            <MenuItem value={4}>
              <span> Other </span>
            </MenuItem>
          </Select>
          {selectedDate == 4 && (
            <div className="input-field mb-4 text-bg-primary w-full">
              <p className="text-text-gray my-2">
                Input date ( between 1 to 31 )
              </p>
              <InputBase
                value={date}
                name="date"
                // type="string"
                onChange={handleChange}
                // {...register('date', {
                //   required: 'Required',
                //   pattern: {
                //     value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                //     message: 'invalid date ',
                //   },
                // })}
                sx={{
                  borderRadius: '15px',
                  flex: 1,
                  py: 2,
                  px: 2,
                  backgroundColor: 'primary.text.input_bg',
                  width: 1,
                }}
              />
              {errors.date && errors.date.message}
            </div>
          )}
        </div>

        <div className="mt-5">
          <p className="text-text-gray my-2">Trending Messages</p>
          <div className="flex overflow-x-auto">
            <div className="flex space-x-4 py-4">
              {messages.map((item, idx) => {
                const [date, time] = item.createdAt.split('T');
                const [month, day] = date.split('-');
                const [hour, minute] = time.split('.')[0].split(':');
                return (
                  <div
                    className="flex flex-col p-3 bg-bg-gray  rounded-xl mr-8 w-[250px] relative"
                    key={idx}
                  >
                    <div className="absolute flex top-0 right-0 h-[26px] w-[26px] border-bg-primary items-center justify-center border-bg-primary border-2 rounded-[10px] bg-bg-parentprimary">
                      <CloseIcon
                        className="text-bg-primary h-[10px] w-[10px]"
                        onClick={(e) => handleRemoveMsgClick(idx)}
                      />
                    </div>
                    <div className="flex items-center justify-start">
                      <Avatar
                        src={`${
                          process.env.REACT_APP_BACKEND_ORIGIN_URL
                        }/avatar/${
                          item.userId.length > 0
                            ? item.userId[0].id
                            : 'Deleted User'
                        }.png`}
                        sx={{ width: 24, height: 24 }}
                      />
                      <p className="my-2 text-bg-primary text-ssm ml-2">
                        {item.userId.length > 0
                          ? item.userId[0].user_name
                          : 'Deleted User'}
                      </p>
                    </div>
                    <p className="text-base">{truncateString(item.content)}</p>
                    <p className="text-text-gray text-end">
                      {' '}
                      {`${hour}:${minute} | ${month}/${day}`}{' '}
                    </p>
                    <Divider variant="middle" className="!my-2" />
                    <button className="flex justify-between items-center ">
                      <div className="flex items-center">
                        <div>
                          <p className="text-ssm text-bg-primary ml-2">{`${item.comments.length} comments*`}</p>
                        </div>
                      </div>
                      <KeyboardArrowRightIcon className="!text-lg text-bg-primary" />
                    </button>
                  </div>
                );
              })}
              <button
                className="rounded border-2 border-dashed border-gray-100 flex justify-center items-center py-12 w-[100px] "
                onClick={() =>
                  pageType == 1
                    ? updateTemplateAndGoPost()
                    : navigate('/admin/news/postselect', {
                        state: {
                          templateName,
                          urls,
                          news,
                          selectedDate,
                          messages,
                          content,
                        },
                      })
                }
              >
                <AddIcon className="text-text-gray !text-ti" />
              </button>
            </div>
          </div>
        </div>

        <div className="input-field mb-4 text-bg-primary mt-5">
          <p className="text-text-gray my-2">Content</p>
          <InputBase
            value={content}
            multiline
            rows={5}
            name="content"
            type="text"
            onChange={handleChange}
            sx={{
              borderRadius: '15px',
              flex: 1,
              py: 1,
              px: 2,
              backgroundColor: 'primary.text.input_bg',
              width: 1,
            }}
          />
        </div>

        <Button
          variant="contained"
          size="medium"
          name="button"
          onClick={handleClick}
          color={'primary'}
          sx={{
            borderRadius: 4,
            py: 2,
            width: 1,
            my: 3,
          }}
        >
          {pageType == 0 ? 'Create' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
