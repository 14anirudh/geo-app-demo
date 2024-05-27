import { getSession } from 'next-auth/react';

export default function ProtectedPage({ data }) {
  return <div>{data}</div>;
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // Fetch geospatial data from your database
  const data = 'Protected geospatial data';

  return {
    props: { data },
  };
}
