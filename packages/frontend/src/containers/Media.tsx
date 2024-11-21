import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API, Storage } from "aws-amplify";
import { onError } from "../lib/errorLib";
import { s3Upload } from "../lib/awsLib";
import config from "../config";
import Form from "react-bootstrap/Form";
import { MediaType } from "../types/media";
import Stack from "react-bootstrap/Stack";
import LoaderButton from "../components/LoaderButton";
import "./Media.css";

export default function Media() {
  const file = useRef<null | File>(null)
  const { id } = useParams();
  const nav = useNavigate();
  const [media, setMedia] = useState<null | MediaType>(null);
  const [title, setTitle] = useState("");
  const [languagecode, setLanguagecode] = useState("");
  const [customvocabulary, setCustomvocabulary] = useState("");
  const [emailto, setEmailto] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    function loadMedia() {
      return API.get("media", `/media/${id}`, {});
    }

    async function onLoad() {
      try {
        const media = await loadMedia();
        const { title, attachment, languagecode, customvocabulary, emailto } = media;

        if (attachment) {
          media.attachmentURL = await Storage.vault.get(attachment);
        }

        setTitle(title);
        setLanguagecode(languagecode);
        setCustomvocabulary(customvocabulary);
        setEmailto(emailto);
        setMedia(media);
      } catch (e) {
        console.error(e);
        onError(e);
      }
    }

    onLoad();
  }, [id]);

  function validateForm() {
    return title.length > 0;
  }
  
  function formatFilename(str: string) {
    return str.replace(/^\w+-/, "");
  }
  
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.currentTarget.files === null) return;
    file.current = event.currentTarget.files[0];
  }
  
  function saveMedia(media: MediaType) {
    return API.put("media", `/media/${id}`, {
      body: media,
    });
  }
  
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    let attachment;
  
    event.preventDefault();
  
    if (file.current && file.current.size > config.MAX_ATTACHMENT_SIZE) {
      alert(
        `Please pick a file smaller than ${
          config.MAX_ATTACHMENT_SIZE / 1000000
        } MB.`
      );
      return;
    }
  
    setIsLoading(true);
  
    try {
      if (file.current) {
        attachment = await s3Upload(file.current);
      } else if (media && media.attachment) {
        attachment = media.attachment;
      }
  
      await saveMedia({
        title: title,
        attachment: attachment,
        languagecode: languagecode,
        customvocabulary: customvocabulary,
        emailto: emailto,
      });
      nav("/");
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
  }
  
  function deleteMedia() {
    return API.del("media", `/media/${id}`, {});
  }
  
  async function handleDelete(event: React.FormEvent<HTMLModElement>) {
    event.preventDefault();
  
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?"
    );
  
    if (!confirmed) {
      return;
    }
  
    setIsDeleting(true);
  
    try {
      await deleteMedia();
      nav("/");
    } catch (e) {
      onError(e);
      setIsDeleting(false);
    }
  }
  
  return (
    <div className="Media">
      {media && (
        <Form onSubmit={handleSubmit}>
          <Stack gap={3}>
            <Form.Group controlId="title">
              <Form.Control
                size="lg"
                as="textarea"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="languagecode">
              <Form.Control
                size="lg"
                as="textarea"
                value={languagecode}
                onChange={(e) => setLanguagecode(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="customvocabulary">
              <Form.Control
                size="lg"
                as="textarea"
                value={customvocabulary}
                onChange={(e) => setCustomvocabulary(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="emailto">
              <Form.Control
                size="lg"
                as="textarea"
                value={emailto}
                onChange={(e) => setEmailto(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mt-2" controlId="file">
              <Form.Label>Attachment</Form.Label>
              {media.attachment && (
                <p>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={media.attachmentURL}
                  >
                    {formatFilename(media.attachment)}
                  </a>
                </p>
              )}
              <Form.Control onChange={handleFileChange} type="file" />
            </Form.Group>
            <Stack gap={1}>
              <LoaderButton
                size="lg"
                type="submit"
                isLoading={isLoading}
                disabled={!validateForm()}
              >
                Save
              </LoaderButton>
              <LoaderButton
                size="lg"
                variant="danger"
                onClick={handleDelete}
                isLoading={isDeleting}
              >
                Delete
              </LoaderButton>
            </Stack>
          </Stack>
        </Form>
      )}
    </div>
  );
}