
import { paths } from '@/config/paths';
import { Link } from 'react-router';

const NotFoundRoute = () => {
  return (
    <div className="mt-52 flex flex-col items-center font-semibold">
      <h1>404 - Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <Link className='px-4 py-2 container bg-amber-100' to={paths.home.getHref()} replace>
        Go to Home
      </Link>
    </div>
  );
};

export default NotFoundRoute;
