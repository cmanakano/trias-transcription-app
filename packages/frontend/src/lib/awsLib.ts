import { Storage } from "aws-amplify";

export async function s3Upload(file: File) {
    const filename = `${Date.now()}-${file.name}`;

    const stored = await Storage.put(filename, file, {
        contentType: file.type,
    });

    return stored.key;
}