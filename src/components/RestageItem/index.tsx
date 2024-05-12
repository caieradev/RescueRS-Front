import ListGroup from "react-bootstrap/ListGroup";
import Icon from "@mdi/react";
import clsx from "clsx";
import {
  mdiCancel,
  mdiCellphone,
  mdiCheck,
  mdiClockOutline,
  mdiMapMarker,
  mdiMapMarkerOutline,
  mdiWhatsapp,
} from "@mdi/js";
import { Badge, Button, Col, Row, Spinner } from "react-bootstrap";
import moment from "moment";
import "moment/dist/locale/pt-br";
import { useAuth } from "../../context/AuthContext";
import { useApi } from "../../hooks/api";
import {
  APIConfirmRequest,
  APIResponse,
  formatarDistancia,
  queryClient,
} from "../../config/define";
import { useState } from "react";
import { useConfirmModal } from "../../context/ConfirmModal";
import haversine from "haversine";

enum RescueStatus {
  Pending = 0,
  Started = 1,
  Completed = 2,
}

type RestageItemProps = {
  rescueId: string;
  requestDateTime: string;
  adultsNumber: number;
  childrenNumber: number;
  elderlyNumber: number;
  animalsNumber: number;
  disabledNumber: number;
  cellphone?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  status?: RescueStatus;
  isRescuer?: boolean;
  startedByMe?: boolean;
  refreshData?: () => void;
};

enum RescueAction {
  Confirm = "Confirm",
  Cancel = "Cancel",
  Start = "Start",
}

export default function RestageItem(props: RestageItemProps) {
  const { token, position } = useAuth();
  const { post } = useApi();
  const { openModal } = useConfirmModal();

  const [loading, setLoading] = useState(false);
  const [removed, setRemoved] = useState(false);

  async function handleAction(action: RescueAction) {
    setLoading(true);
    const data: APIConfirmRequest = {
      rescueId: props.rescueId,
    };

    const resp = await post<APIConfirmRequest, APIResponse>(
      `${import.meta.env.VITE_API_URL}/Rescue/${action}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (resp.Result === 1) {
      queryClient.invalidateQueries({
        refetchType: "all",
        queryKey: ["ListPengingRescues"],
      });
      queryClient.invalidateQueries({
        refetchType: "all",
        queryKey: ["ListCompletedRescues"],
      });
      queryClient.resetQueries();
      setRemoved(true);
    } else {
      alert(resp.Message ?? "Ocorreu algum problema, tente novamente");
    }
    setLoading(false);
  }

  if (removed) return null;

  return (
    <ListGroup.Item className="rounded border position-relative overflow-hidden shadow">
      <div
        className={`position-absolute bg-${
          clsx({
            primary: props.status === RescueStatus.Started && props.startedByMe,
            success: props.status === RescueStatus.Completed,
          }) || "light"
        }`}
        style={{ left: 0, top: 0, bottom: 0, width: 8 }}
      />
      <div className="d-flex flex-column gap-2">
        <div className="d-flex justify-content-between">
          <div>
            {props.status === RescueStatus.Pending && (
              <Badge pill bg="warning" text="dark" className="fs-6">
                Pendente
              </Badge>
            )}
            {props.status === RescueStatus.Started && (
              <Badge
                pill
                bg={props.startedByMe ? "primary" : "secondary"}
                className="fs-6"
              >
                {props.startedByMe ? "Você iniciou" : "Em andamento"}
              </Badge>
            )}
            {props.status === RescueStatus.Completed && (
              <Badge pill bg="success" className="fs-6">
                Finalizado
              </Badge>
            )}
          </div>
          <div className="d-flex flex-column align-items-end text-muted small">
            <div className="d-flex align-items-center justify-content-start">
              <Icon path={mdiClockOutline} size={0.6} className="me-1" />
              Solicitado{" "}
              {moment(props.requestDateTime).locale("pt-br").fromNow()}
            </div>
            {props.distance && (
              <div className="d-flex align-items-center justify-content-start">
                <Icon path={mdiMapMarkerOutline} size={0.6} className="me-1" />
                Distancia{` `}
                {position &&
                  formatarDistancia(
                    haversine(
                      { latitude: position.lat, longitude: position.lng },
                      {
                        latitude: props.latitude!,
                        longitude: props.longitude!,
                      },
                      { unit: "meter" },
                    ),
                  )}
              </div>
            )}
          </div>
        </div>
        <Row>
          {props.adultsNumber > 0 && (
            <Col className="d-flex flex-column justify-content-center align-items-center">
              <div className="fw-bold fs-1">{props.adultsNumber}</div>
              <div className="fw-medium">Adultos</div>
            </Col>
          )}
          {props.childrenNumber > 0 && (
            <Col className="d-flex flex-column justify-content-center align-items-center">
              <div className="fw-bold fs-1">{props.childrenNumber}</div>
              <div className="fw-medium">Crianças</div>
            </Col>
          )}
          {props.elderlyNumber > 0 && (
            <Col className="d-flex flex-column justify-content-center align-items-center">
              <div className="fw-bold fs-1">{props.elderlyNumber}</div>
              <div className="fw-medium">Idosos</div>
            </Col>
          )}
          {props.animalsNumber > 0 && (
            <Col className="d-flex flex-column justify-content-center align-items-center">
              <div className="fw-bold fs-1">{props.animalsNumber}</div>
              <div className="fw-medium">Animais</div>
            </Col>
          )}
          {props.disabledNumber > 0 && (
            <Col className="d-flex flex-column justify-content-center align-items-center">
              <div className="fw-bold fs-1">{props.disabledNumber}</div>
              <div className="fw-medium">PCD</div>
            </Col>
          )}
        </Row>

        <div className="d-flex gap-1">
          {props.latitude && props.longitude ? (
            <Button
              as="a"
              variant="outline-dark"
              target="_blank"
              className="d-flex align-items-center justify-content-center flex-fill"
              href={`https://www.google.com/maps/place/${props.latitude},${props.longitude}`}
              disabled={loading}
            >
              <Icon
                path={mdiMapMarker}
                size={0.8}
                className="me-1 text-danger"
              />
              Mapa
            </Button>
          ) : null}
          {props.cellphone && (
            <>
              <Button
                as="a"
                variant="outline-dark"
                target="_blank"
                className="d-flex align-items-center justify-content-center flex-fill"
                href={`tel:${props.cellphone}`}
                disabled={loading}
              >
                <Icon path={mdiCellphone} size={0.8} className="me-1" /> Celular
              </Button>
              <Button
                as="a"
                variant="outline-dark"
                target="_blank"
                className="d-flex align-items-center justify-content-center flex-fill"
                href={`https://wa.me/55${props.cellphone}`}
                disabled={loading}
              >
                <Icon
                  path={mdiWhatsapp}
                  size={0.8}
                  className="me-1 text-success"
                />
                Whats
              </Button>
            </>
          )}
        </div>

        {props.isRescuer && (
          <>
            {props.status !== RescueStatus.Completed && (
              <hr className="my-1 border-secondary" />
            )}
            <Row>
              {props.status === RescueStatus.Pending && (
                <Col className="d-flex">
                  <Button
                    as="button"
                    variant="primary"
                    size="lg"
                    className="d-flex align-items-center justify-content-center flex-fill fw-medium"
                    onClick={async () => {
                      const confirm = await openModal({
                        title: "Iniciar o resgate",
                        message: (
                          <>
                            Você está confirmando que irá realizar o resgate.
                            <br />
                            Confirma essa ação?
                          </>
                        ),
                        confirmButtonText: "Iniciar",
                      });
                      if (confirm) {
                        handleAction(RescueAction.Start).then(
                          props.refreshData,
                        );
                      }
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <Spinner size="sm" className="me-2" />
                    ) : (
                      <Icon path={mdiCheck} size={1} className="me-2" />
                    )}
                    Iniciar resgate
                  </Button>
                </Col>
              )}

              {props.status === RescueStatus.Started && (
                <div className="d-flex flex-column gap-2">
                  <Button
                    as="button"
                    variant="success"
                    size="lg"
                    className="d-flex align-items-center justify-content-center flex-fill fw-medium"
                    onClick={async () => {
                      const confirm = await openModal({
                        title: "Confirmar resgate",
                        message: (
                          <>
                            O resgate será marcado como finalizado.
                            <br />
                            Confirma essa ação?
                          </>
                        ),
                      });
                      if (confirm) {
                        handleAction(RescueAction.Confirm).then(
                          props.refreshData,
                        );
                      }
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <Spinner size="sm" className="me-2" />
                    ) : (
                      <Icon path={mdiCheck} size={1} className="me-2" />
                    )}
                    Concluir
                  </Button>
                  <Button
                    as="button"
                    variant="light"
                    className="d-flex align-items-center justify-content-center flex-fill"
                    onClick={async () => {
                      const confirm = await openModal({
                        title: "Cancelar regate",
                        message: (
                          <>
                            O resgate voltará à lista de pendentes.
                            <br />
                            Confirma essa ação?
                          </>
                        ),
                        confirmButtonText: "Cancelar resgate",
                        cancelButtonText: "Manter",
                        isDanger: true,
                      });
                      if (confirm) {
                        handleAction(RescueAction.Cancel);
                      }
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <Spinner size="sm" className="me-2" />
                    ) : (
                      <Icon path={mdiCancel} size={1} className="me-2" />
                    )}
                    Cancelar
                  </Button>
                </div>
              )}
            </Row>
          </>
        )}
      </div>
    </ListGroup.Item>
  );
}
