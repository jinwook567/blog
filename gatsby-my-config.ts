import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const config = {
  siteMetadata: {
    title: `nr567.xyz`,
    siteUrl: 'https://nr567.xyz',
    author: {
      name: 'jinwook567',
      description: '비즈니스에 관심이 많은 개발자입니다.',
      social: {
        github: 'https://github.com/jinwook567',
        email: 'dlwlsdnr567@naver.com',
        instagram: '',
      },
    },
  },
  ga: {
    trackingIds: [process.env.GA_TRACKING_ID].filter(id => id),
  },
};

export default config;
