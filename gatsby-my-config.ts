import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const config = {
  siteMetadata: {
    title: `jinwook`,
    siteUrl: 'https://jinwook567.github.io/blog',
    author: {
      name: 'jinwook567',
      description: '비즈니스에 관심이 많은 개발자입니다.',
      social: {
        github: 'https://github.com/jinwook567',
        email: 'swiminthepool66@gmail.com',
        instagram: '',
      },
    },
  },
  ga: {
    trackingIds: [process.env.GA_TRACKING_ID].filter(id => id),
  },
};

export default config;
