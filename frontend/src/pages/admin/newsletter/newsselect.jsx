import { useState, useEffect } from 'react';
import {
  SvgIcon,
  Avatar,
  Divider,
  AvatarGroup,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import { useAuth } from 'hooks/useAuth';
import { ReactComponent as LeftArrowIcon } from '../../../assets/svg/left_arrow.svg';
import { useForm } from 'react-hook-form';
import { KeyboardArrowRight as KeyboardArrowRightIcon } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { setAuth } from 'utils/setAuth';
import instance from 'utils/axios';
import jwtDecode from 'jwt-decode';
import { truncateString } from 'utils/global';

export default function NewsSelect() {
  const { user } = useAuth();
  const { state } = useLocation();
  const [pageType, setPageType] = useState(state?.id ? 1 : 0);
  const [templateId, setTemplateId] = useState(state?.id ? state.id : '');
  const [templateName, setTemplateName] = useState(
    state?.templateName ? state.templateName : ''
  );
  const [selectedDate, setselectedDate] = useState(
    state?.selectedDate ? state.selectedDate : ''
  );
  const [content, setcontent] = useState(state?.content ? state.content : '');
  const [urls, setUrls] = useState(state?.urls ? state.urls : []);
  const [news, setNews] = useState([]);
  const [templateInfo, setTemplateInfo] = useState({});
  const [messages, setMessages] = useState(
    state?.messages ? state.messages : []
  );
  const [originMessages, setOriginMessages] = useState(
    state?.messages ? state.messages : []
  );
  const navigate = useNavigate();

  const getInitialMessages = () => {
    console.log(urls);
    instance
      .post('/newsletter/urltest', {
        urls: urls.length == 0 ? [] : urls.replace(/\s/g, '').split(','),
      })
      .then((res) => {
        const updatedNews = res.data.map((news) => ({
          ...news,
          selected: false,
        }));
        if (updatedNews.length == 0) {
          alert('Can not scape news from URLs...');
          back();
          return;
        } else {
          console.log(updatedNews);
          setNews(updatedNews);
          return;
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
    console.log('useeffectaclled twice ------------------');
    getInitialMessages();
  }, []);

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm();

  const handleCheck = (i) => {
    console.log('handlecheck -----------');
    const newNews = [...news];
    newNews[i].selected = !newNews[i].selected;
    setNews(newNews);
  };

  const back = () => {
    if (pageType == 1) {
      console.log(news);
      const newTemplateInfo = {
        news: news.filter((item) => item.selected == true),
      };
      console.log(newTemplateInfo);
      console.log(newTemplateInfo);
      instance
        .post('/newsletter/updateTemplate', {
          _id: templateId,
          newTemplateInfo,
        })
        .then((res) => {
          navigate('/admin/news/create', {
            state: { id: templateId },
          });
        });
    } else {
      navigate('/admin/news/create', {
        state: {
          templateName,
          urls,
          news: news.filter((item) => item.selected == true),
          selectedDate,
          content,
          messages,
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
          {news.length == 0 ? 'Scrapping now ...' : 'Select News'}
        </p>

        <div className="flex justify-center items-center mb-2"></div>
      </div>

      <div className="mt-5 h-full rounded-t-3xl py-5 px-9 md:px-56 w-full bg-bg-white p-4 ">
        {news.length == 0 ? (
          <div className="fixed top-0 left-0 z-[5001] w-full h-full bg-bg-black opacity-50 flex justify-center items-center">
            <CircularProgress />
          </div>
        ) : (
          ''
        )}
        {news.map((item, i) => {
          return (
            <div
              key={i}
              className="inline-flex w-full mt-2 mb-2"
              onClick={() => handleCheck(i)}
            >
              <div className="flex flex-col p-3 bg-bg-gray w-full ml-3 rounded-xl mr-8">
                <p className="my-2 text-bg-primary">
                  {truncateString(item.title)}
                </p>
                <p className="text-sm">{item.description}</p>
                <p className="text-text-gray text-end text-sm">{item.date}</p>
                <Divider variant="middle" className="!my-2" />
                <button className="flex justify-between items-center ">
                  <div className="flex items-center">
                    <div></div>
                    <p className="text-ssm text-bg-primary ml-2">{item.url}</p>
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
