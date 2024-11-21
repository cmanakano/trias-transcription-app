import { useState, useEffect } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import { useAppContext } from "../lib/contextLib";
import { onError } from "../lib/errorLib";
import { MediaType } from "../types/media";
import { BsPencilSquare } from "react-icons/bs";
import { LinkContainer } from "react-router-bootstrap";
import { API } from "aws-amplify";
import "./Home.css";

export default function Home() {
  const [media, setMedia] = useState<Array<MediaType>>([]);
  const { isAuthenticated } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function onLoad() {
      if (!isAuthenticated) {
        return;
      }
  
      try {
        const media = await loadMedia();
        setMedia(media);
      } catch (e) {
        onError(e);
      }
  
      setIsLoading(false);
    }
  
    onLoad();
  }, [isAuthenticated]);
  
  function loadMedia() {
    return API.get("media", "/media", {});
  }

  function formatDate(str: undefined | string) {
    return !str ? "" : new Date(str).toLocaleString();
  }

  function renderMediaList(media: MediaType[]) {
    return (
      <>
        <LinkContainer to="/media/new">
          <ListGroup.Item action className="py-3 text-nowrap text-truncate">
            <BsPencilSquare size={17} />
            <span className="ms-2 fw-bold">Create a new note</span>
          </ListGroup.Item>
        </LinkContainer>
        {media.map(({ mediaId, title, createdAt }) => (
        <LinkContainer key={mediaId} to={`/media/${mediaId}`}>
          <ListGroup.Item action className="text-nowrap text-truncate">
            <span className="fw-bold">{title.trim().split("\n")[0]}</span>
            <br />
            <span className="text-muted">
              Created: {formatDate(createdAt)}
            </span>
          </ListGroup.Item>
        </LinkContainer>
      ))}
      </>
    );
  }

  function renderLander() {
    return (
      <div className="lander">
        <h1>Trias Transcribe</h1>
        <p className="text-muted">A simple transcription app</p>
      </div>
    );
  }

  function renderMedia() {
    return (
      <div className="media">
        <h2 className="pb-3 mt-4 mb-3 border-bottom">Your Media</h2>
        <ListGroup>{!isLoading && renderMediaList(media)}</ListGroup>
      </div>
    );
  }

  return (
    <div className="Home">
      {isAuthenticated ? renderMedia() : renderLander()}
    </div>
  );
}