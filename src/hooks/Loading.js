import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";

export default function Loading() {
  return (
    <center>
      <Divider>
        <Link
          href={process.env.REACT_APP_HOMEPAGE}
        >
          {process.env.REACT_APP_NAME === "easy-translator"
            ? `轻松翻译 / Easy Translator v${process.env.REACT_APP_VERSION}`
            : `Easy Translator v${process.env.REACT_APP_VERSION}`}
        </Link>
      </Divider>
      <CircularProgress />
    </center>
  );
}
