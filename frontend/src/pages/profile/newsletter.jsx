import { useState, createRef, useEffect } from 'react';
import { SvgIcon, IconButton, Button, InputBase } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import { ReactComponent as LeftArrowIcon } from '../../assets/svg/left_arrow.svg';
import { ReactComponent as FileAlt } from '../../assets/svg/file_alt.svg';
import { useForm } from 'react-hook-form';
import instance from 'utils/axios';
import { ReactComponent as NewsIcon } from '../../assets/svg/news_icon.svg';
import { ReactComponent as NewsIconRed } from '../../assets/svg/news_icon_red.svg';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function NewsLetter() {
  const services = [
    'The latest news',
    'Interesting content',
    'Most commented posts from Hangar and FC',
  ];

  const navigate = useNavigate();
  const inputFileRef = createRef(null);
  const [pdf, _setPDF] = useState(null);
  const [isSubscribe, setSubscribe] = useState(false);

  useEffect(() => {
    getSubscribe();
  }, []);

  const getSubscribe = () => {
    instance
      .post('/newsletter/getSubscribe')
      .then((res) => {
        if (res.data.length == 0) return;
        setCurrentEmail(res.data[0].emails.join(', ').replace(/\s{2,}/g, ' '));
        setSubscribe(res.data[0].subscribeStatus);
      })
      .catch((err) => {
        if (err.response.status === 401) {
          navigate('/signin');
        }
        console.log('/newsletter/updateTemplate error ', err);
      });
  };

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm();

  const [emails, setEmails] = useState([]);
  const [currentEmail, setCurrentEmail] = useState('');

  const handleInputChange = (e) => {
    setCurrentEmail(e.target.value);
  };

  // const handleKeyDown = (e) => {
  //   if (e.key === 'Enter' && currentEmail.trim() !== '') {
  //     e.preventDefault();
  //     if (!validateEmail(currentEmail.trim())) {
  //       alert('Please input valid email address');
  //       return;
  //     }
  //     setEmails([...emails, currentEmail.trim()]);
  //     updateSubscribe([...emails, currentEmail.trim()], isSubscribe);
  //     setCurrentEmail('');
  //   }
  // };

  const updateSubscribe = (emails, isSubscribe) => {
    instance
      .post('/newsletter/updateSubscribe', {
        emails,
        subscribeStatus: isSubscribe,
      })
      .then((res) => {
        console.log('Subscribe status updated ----');
      })
      .catch((err) => {
        if (err.response.status === 401) {
          navigate('/signin');
        }
        console.log('/newsletter/updateTemplate error ', err);
      });
  };

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  // const removeEmail = (index) => {
  //   const updatedEmails = [...emails];
  //   updatedEmails.splice(index, 1);
  //   setEmails(updatedEmails);
  //   if (updatedEmails.length == 0 && isSubscribe == true) {
  //     updateSubscribe(updatedEmails, !isSubscribe);
  //     setSubscribe(!isSubscribe);
  //   } else updateSubscribe(updatedEmails, isSubscribe);
  // };

  const onBack = () => {
    const emails = currentEmail.replace(/\s/g, '').split(',');
    for (let i = 0; i < emails.length; i++) {
      if (!validateEmail(emails[i])) {
        alert(
          "Please input valid email addresses seperated with ',' ( comma ) "
        );
        return;
      }
    }
    updateSubscribe(emails, isSubscribe);
    navigate('/profile');
  };

  const placeholder = emails.length === 0 ? 'Enter email and press Enter' : '';

  return (
    <div className="w-full h-full bg-bg-primary">
      <div className="inline-flex w-full justify-between pt-8 px-9 items-center">
        <div>
          <div onClick={onBack} className="text-bg-primary">
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

        <div className="place-self-end mb-2"></div>
      </div>

      <div className="mt-5 h-full rounded-t-3xl  py-5 px-9 md:px-56 w-full bg-bg-white p-4 ">
        <div className="flex justify-center">
          <SvgIcon
            component={isSubscribe ? NewsIconRed : NewsIcon}
            inheritViewBox
            sx={{
              fontSize: '150px',
              marginTop: '2px',
            }}
          ></SvgIcon>
        </div>
        <div className="flex justify-center items-center mt-5">
          <p className="text-bg-red text-ti font-semibold !font-futura text-center">
            {isSubscribe ? 'Subscribed' : 'Unsubscribed'}
          </p>
        </div>
        <div className="mt-9">
          {services.map((item, i) => {
            return (
              <div key={i} className="flex flex-row items-center">
                <IconButton sx={{ p: '10px' }} aria-label="menu">
                  <CheckCircleIcon sx={{ color: 'primary.main' }} />
                </IconButton>
                <p
                  className="text-base text-text-gray m-0"
                  color="primary.text.second"
                >
                  {item}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mb-4 p-4 text-bg-primary">
          <p className="text-text-gray my-2 ">
            Emails for subscribe seperated with a ',' ( comma )
          </p>
          <InputBase
            value={currentEmail}
            multiline
            rows={4}
            type="text"
            onChange={handleInputChange}
            sx={{
              borderRadius: '15px',
              flex: 1,
              py: 2,
              px: 3,
              backgroundColor: 'primary.text.input_bg',
              width: 1,
            }}
          />
        </div>

        <div className=" flex  px-4 mt-10">
          <Button
            variant="contained"
            size="medium"
            onClick={() => {
              const emails = currentEmail.replace(/\s/g, '').split(',');
              if (currentEmail == '') {
                alert(
                  "Please input one or more email addresses seperated with ',' ( comma ) "
                );
                return;
              }
              for (let i = 0; i < emails.length; i++) {
                if (!validateEmail(emails[i])) {
                  alert(
                    "Please input valid email addresses seperated with ',' ( comma ) "
                  );
                  return;
                }
              }
              setSubscribe(!isSubscribe);
              updateSubscribe(emails, !isSubscribe);
            }}
            color={isSubscribe ? 'disable_gray' : 'primary'}
            sx={{
              borderRadius: 4,
              py: 2,
              width: 1,
              my: 3,
            }}
          >
            {isSubscribe ? 'Unsubscribe' : 'Subscribe'}
          </Button>
        </div>
      </div>
    </div>
  );
}
