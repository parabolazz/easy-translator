import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";

export default function Loading() {
  const displayName = process.env.REACT_APP_NAME_CN
    ? `${process.env.REACT_APP_NAME_CN} / ${process.env.REACT_APP_NAME}`
    : process.env.REACT_APP_NAME;

  return (
    <center>
      <Divider>
        <Link
          href={process.env.REACT_APP_HOMEPAGE}
        >
          {`${displayName} v${process.env.REACT_APP_VERSION}`}
        </Link>
      </Divider>
      <CircularProgress />
    </center>
  );
}
