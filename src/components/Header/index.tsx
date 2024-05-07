import { mdiHandHeartOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { Button } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const { token, setAuth } = useAuth();

  function handleSair() {
    setAuth(undefined, undefined);
    navigate("/");
  }

  return (
    <div className="d-flex flex-row align-items-center justify-content-between my-4">
      <div className="flex-fill"></div>
      <div className="d-flex flex-row align-items-center justify-content-center">
        <Icon path={mdiHandHeartOutline} size={1.5} className="me-3" />
        <h2 className="my-0">Rescue RS</h2>
      </div>
      <div className="flex-fill">
        {token && (
          <Button variant="outline-dark" className="ms-4" onClick={handleSair}>
            Sair
          </Button>
        )}
      </div>
    </div>
  );
}
