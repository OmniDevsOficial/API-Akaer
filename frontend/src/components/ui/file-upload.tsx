import { useCallback, useMemo, useState, useEffect } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface FileUploadProps {
    onFileSelected: (file: File | null) => void;
    value?: File | null;
    fileUrl?: string;
    existingFile?: {
        name: string;
        url: string;
        size?: number;
    };
    onClearExisting?: () => void;
}

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

export function FileUpload({ onFileSelected, value, fileUrl, existingFile, onClearExisting }: FileUploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [hideExisting, setHideExisting] = useState(false);

    const isControlled = value !== undefined;
    const fileAtual = isControlled ? value : selectedFile;

    const formatSize = useMemo(
        () =>
            new Intl.NumberFormat('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }),
        [],
    );

    const onDropAccepted = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles[0] ?? null;
            setErrorMessage('');
            if (!isControlled) {
                setSelectedFile(file);
            }
            onFileSelected(file);
        },
        [isControlled, onFileSelected],
    );

    const onDropRejected = useCallback((rejections: FileRejection[]) => {
        const firstRejection = rejections[0];
        const firstError = firstRejection?.errors[0];

        let message = 'Nao foi possivel selecionar o arquivo.';
        if (firstError?.code === 'file-invalid-type') {
            message = 'Formato invalido. Envie apenas PDF.';
        }
        if (firstError?.code === 'file-too-large') {
            message = 'Arquivo muito grande. O limite e 20MB.';
        }
        if (firstError?.code === 'too-many-files') {
            message = 'Selecione apenas 1 arquivo.';
        }

        if (!isControlled) {
            setSelectedFile(null);
        }
        onFileSelected(null);
        setErrorMessage(message);
    }, [isControlled, onFileSelected]);

    const handleClearFile = useCallback(() => {
        if (!isControlled) {
            setSelectedFile(null);
        }
        setErrorMessage('');
        onFileSelected(null);
    }, [isControlled, onFileSelected]);

    useEffect(() => {
        setHideExisting(false);
    }, [existingFile?.name, existingFile?.url]);

    const handleClearExisting = useCallback(() => {
        setHideExisting(true);
        setErrorMessage('');
        onFileSelected(null);
        onClearExisting?.();
    }, [onClearExisting, onFileSelected]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDropAccepted,
        onDropRejected,
        multiple: false,
        maxFiles: 1,
        maxSize: MAX_FILE_SIZE_BYTES,
        accept: {
            'application/pdf': ['.pdf'],
        },
    });

    return (
        <div className="h-full px-3 py-3">
            <div
                {...getRootProps()}
                className={`flex flex-col items-center justify-center w-full h-full border-2 bg-gray-100/80 border-gray-500 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out
          ${isDragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:bg-accent/50 hover:border-muted-foreground/50'
                    }
        `}
            >
                <input {...getInputProps()} />

                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload
                        className={`w-10 h-10 mb-4 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`}
                    />

                    {isDragActive ? (
                        <p className="text-sm font-medium text-primary">Solte o arquivo aqui...</p>
                    ) : (
                        <>
                            <p className="text-sm font-medium text-foreground mb-1 text-center">
                                <span className="font-semibold text-red-akaer">Clique para fazer upload</span> ou arraste e solte
                            </p>
                            <p className="text-xs text-muted-foreground text-center">PDF, DOC ou DOCX (maximo de 20MB)</p>
                        </>
                    )}
                </div>
            </div>

            {fileAtual && (
                <div className="min-h-6 mt-4 text-sm text-start">
                    {fileAtual && !errorMessage ? (
                        <div className="flex items-center justify-between gap-2 text-red-akaer">
                            <span className="truncate">
                                {fileUrl ? (
                                    <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="hover:underline"
                                    >
                                        {fileAtual.name} ({formatSize.format(fileAtual.size / (1024 * 1024))} MB)
                                    </a>
                                ) : (
                                    <>
                                        {fileAtual.name} ({formatSize.format(fileAtual.size / (1024 * 1024))} MB)
                                    </>
                                )}
                            </span>
                            <button
                                type="button"
                                className="text-red-akaer hover:underline"
                                onClick={handleClearFile}
                            >
                                Remover
                            </button>
                        </div>
                    ) : null}

                    {errorMessage ? <p className="text-red-akaer">{errorMessage}</p> : null}
                </div>
            )}

            {!fileAtual && existingFile && !hideExisting && !errorMessage && (
                <div className="min-h-6 mt-4 text-sm text-start">
                    <div className="flex items-center justify-between gap-2 text-red-akaer">
                        <span className="truncate">
                            <a
                                href={existingFile.url}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline"
                            >
                                {existingFile.name}
                                {typeof existingFile.size === "number"
                                    ? ` (${formatSize.format(existingFile.size / (1024 * 1024))} MB)`
                                    : ""}
                            </a>
                        </span>
                        <button
                            type="button"
                            className="text-red-akaer hover:underline"
                            onClick={handleClearExisting}
                        >
                            Remover
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}