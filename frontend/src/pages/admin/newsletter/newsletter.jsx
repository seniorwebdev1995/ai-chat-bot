import { useState, useEffect } from 'react';
import { SvgIcon, Avatar } from '@mui/material';
import { Link } from 'react-router-dom';
import { ReactComponent as LeftArrowIcon } from '../../../assets/svg/left_arrow.svg';
import { ReactComponent as PenIcon } from '../../../assets/svg/pen_line.svg';
import { ReactComponent as CalendarIcon } from '../../../assets/svg/calendar_day.svg';
import { useForm } from 'react-hook-form';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import instance from 'utils/axios';
import { Add as AddIcon } from '@mui/icons-material';
import { formatDateWithOrdinalSuffix, truncateString } from 'utils/global';

export default function NewsLetterAdmin() {
  const navigate = useNavigate();

  const [subscribeInfo, setSubscribeInfo] = useState([]);
  const [templatesInfo, setTemplatesInfo] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    getAllSubscribeInfo();
    getTemplatesInfo();
  }, []);

  const getAllSubscribeInfo = () => {
    instance
      .post('/newsletter/getAllInfo')
      .then((res) => {
        if (res.data.length == 0) return;
        const modifiedData = res.data.map((item) => ({
          ...item,
          menuOpen: true,
        }));
        setSubscribeInfo(modifiedData);
      })
      .catch((err) => {
        console.log('getAllSubscribeInfo error----', err);
        if (err.response.status === 401) {
          navigate('/signin');
        }
      });
  };

  const getTemplatesInfo = () => {
    instance
      .post('/newsletter/getTemplatesInfo')
      .then((res) => {
        setTemplatesInfo(res.data);
        res.data.map((item, idx) => {
          if (item.selected) setSelectedDate(item.date);
        });
      })
      .catch((err) => {
        console.log('getTemplatesInfo error----', err);
        if (err.response.status === 401) {
          navigate('/signin');
        }
      });
  };

  const toogleShow = (_id) => {
    setSubscribeInfo((prevState) =>
      prevState.map((item) =>
        item._id === _id ? { ...item, menuOpen: !item.menuOpen } : item
      )
    );
  };

  const updateStatus = (_id) => {
    setSubscribeInfo((prevState) =>
      prevState.map((item) => {
        if (item._id === _id) {
          const newItem = { ...item };
          newItem.subscribeStatus = !newItem.subscribeStatus;
          return newItem;
        }
        return item;
      })
    );
    instance
      .post('/newsletter/updateStatus', {
        _id,
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log('getTemplatesInfo error----', err);
        if (err.response.status === 401) {
          navigate('/signin');
        }
      });
  };

  const handleTemplateClick = (idx) => {
    console.log(idx);
    const newtemplatesInfo = [...templatesInfo];
    newtemplatesInfo.map((item, index) => {
      if (idx == index) {
        item.selected = true;
        setSelectedDate(item.date);
        console.log(item);
        try {
          instance.post('/newsletter/updateSelected', {
            _id: item.id,
          });
        } catch (err) {
          console.log('handleTemplateClick error----', err);
          if (err.response.status === 401) {
            navigate('/signin');
          }
          console.log(err);
          throw new Error(err);
        }
      } else item.selected = false;
    });
    setTemplatesInfo(newtemplatesInfo);
  };

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm();

  return (
    <div className="w-full h-full bg-bg-primary">
      <div className="inline-flex w-full justify-between pt-8 px-9 items-center">
        <div>
          <div
            onClick={() => {
              if (templatesInfo.length > 0 && selectedDate == '') {
                alert('Please selected Template');
                return;
              }
              navigate('/profile');
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
          Newsletter
        </p>

        <div className="flex justify-center items-center mb-2"></div>
      </div>

      <div className="mt-5 h-full rounded-t-3xl py-5 px-9 md:px-56 w-full bg-bg-white p-4 ">
        <div className="flex justify-between items-center mt-5">
          <p
            className="text-base text-text-gray m-0 text-lg"
            color="primary.text.second"
          >
            Newsletter Templates
          </p>
          <div className="flex justify-end items-center">
            <SvgIcon
              component={CalendarIcon}
              inheritViewBox
              sx={{ fontSize: '18px' }}
            ></SvgIcon>
            <p
              className="text-base text-text-gray m-1 text-m"
              color="primary.text.second"
            >
              {selectedDate.startsWith('4')
                ? formatDateWithOrdinalSuffix(selectedDate.split(',')[1])
                : selectedDate == '1'
                ? 'First day of Month'
                : selectedDate == '2'
                ? 'Monday'
                : selectedDate == '3'
                ? 'Last day of Month'
                : selectedDate}
            </p>
          </div>
        </div>

        <div className="flex overflow-x-auto">
          <div className="flex space-x-4 p-4">
            {templatesInfo.map((item, idx) => (
              <div
                className="w-[112px] h-[112px] shadow-md rounded-xl mr-2 "
                style={
                  item.selected
                    ? {
                        border:
                          '2px solid rgb(255 75 85 / var(--tw-bg-opacity))',
                      }
                    : {}
                }
                name="template"
                key={idx}
                onClick={() => handleTemplateClick(idx)}
              >
                <div className="flex justify-end items-end pr-1 pt-1">
                  <div className=" flex justify-center items-center w-[32px] h-[32px] bg-[#f5f5f5] rounded-[6px] border-none">
                    <SvgIcon
                      component={PenIcon}
                      inheritViewBox
                      sx={{ fontSize: '16px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/admin/news/create', {
                          state: { id: item.id },
                        });
                      }}
                    ></SvgIcon>
                  </div>
                </div>
                <div className="flex justify-center items-center m-1">
                  <p className="text-center overflow-hidden">{item.name}</p>
                </div>
              </div>
            ))}

            <div
              className="w-[112px] h-[112px] rounded-xl mr-2 border-2 border-dashed border-gray-100 flex justify-center items-center"
              onClick={(e) => {
                navigate('/admin/news/create');
              }}
            >
              <AddIcon className="text-text-gray !text-ti" />
            </div>
          </div>
        </div>

        <div className="flex justify-start items-center mt-5 mb-4">
          <p
            className="text-base text-text-gray m-0 text-lg"
            color="primary.text.second"
          >
            Subscribers
          </p>
        </div>
        {subscribeInfo.map((item, idx) => (
          <div className="flex mb-4" key={idx}>
            <div className="flex justify-around items-start">
              <Avatar
                src={`${process.env.REACT_APP_BACKEND_ORIGIN_URL}/avatar/${
                  item.owner.length == 0 ? 'default' : item.owner[0]._id
                }.png`}
                sx={{ width: 50, height: 50 }}
              />
            </div>
            <div className="flex flex-col pl-2 w-full">
              <div className="flex">
                <p className="text-ssm text-bg-primary"></p>
              </div>
              <div
                className="flex flex-col mt-2 px-2 w-full"
                style={{ borderLeft: '2px solid #999999' }}
              >
                <div className="flex justify-between items-center w-full mb-2">
                  <p className="text-sm mr-4 text-bg-primary">
                    {truncateString(
                      item.owner.length == 0
                        ? item.emails[0]
                        : item.owner[0].full_name,
                      15
                    )}
                  </p>
                  <div className="flex justify-end items-center">
                    {item.menuOpen ? (
                      <KeyboardArrowUpIcon
                        className="text-lg bg-gray-600 mr-10"
                        onClick={() => {
                          toogleShow(item._id);
                        }}
                      />
                    ) : (
                      <KeyboardArrowDownIcon
                        className="text-lg bg-gray-600 mr-10"
                        onClick={() => {
                          toogleShow(item._id);
                        }}
                      />
                    )}
                    <p
                      className="text-sm text-text-gray"
                      onClick={() => updateStatus(item._id)}
                    >
                      {item.subscribeStatus ? 'Enabled' : 'Disabled'}
                    </p>
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
      </div>
    </div>
  );
}
