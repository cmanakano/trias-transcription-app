import React, {useRef, useState} from "react";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import {useNavigate} from "react-router-dom";
import LoaderButton from "../components/LoaderButton";
import config from "../config";
import { API } from "aws-amplify";
import { MediaType } from "../types/media";
import { s3Upload } from "../lib/awsLib";
import { onError } from "../lib/errorLib";
import "./NewMedia.css";

export default function NewMedia() {
    const file = useRef<null | File>(null);
    const nav = useNavigate();
    const [title, setTitle] = useState("");
    const [languagecode, setLanguagecode] = useState("");
    const [customvocabulary, setCustomvocabulary] = useState("");
    const [emailto, setEmailto] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    function validateForm() {
        return title.length > 0;
    }

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        if ( event.currentTarget.files === null ) return
        file.current = event.currentTarget.files[0];
    }

    function createMedia(media: MediaType) {
        return API.post("media", "/media", {
            body: media,
        });
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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
            const attachment = file.current
                ? await s3Upload(file.current)
                : undefined;
      
          await createMedia({ title, attachment, languagecode, customvocabulary, emailto });
          nav("/");
        } catch (e) {
            onError(e);
            setIsLoading(false);
        }
    }

    return (
        <div className="NewMedia">
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="title">
                    <Form.Control
                        value={title}
                        as="textarea"
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="languagecode">
                    <Form.Control
                        value={languagecode}
                        as="textarea"
                        onChange={(e) => setLanguagecode(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="customvocabulary">
                    <Form.Control
                        value={customvocabulary}
                        as="textarea"
                        onChange={(e) => setCustomvocabulary(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="emailto">
                    <Form.Control
                        value={emailto}
                        as="textarea"
                        onChange={(e) => setEmailto(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mt-2" controlId="file">
                    <Form.Label>Attachment</Form.Label>
                    <Form.Control onChange={handleFileChange} type="file" />
                </Form.Group>
                <Stack>
                    <LoaderButton
                        size="lg"
                        type="submit"
                        variant="primary"
                        isLoading={isLoading}
                        disabled={!validateForm()}
                    >
                        Create
                    </LoaderButton>
                </Stack>
            </Form>
        </div>
    );
}