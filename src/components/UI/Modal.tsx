import React from 'react';
import Button from 'react-bootstrap/Button';
import BootstrapModal from 'react-bootstrap/Modal';

export type ModalProps = {
    show: boolean;
    onClose: (confirm: boolean) => void;
    title?: string;
    message?: string;
    type?: 'question' | 'info' | 'error';
};

const Modal: React.FC<ModalProps> = (props) => {
    const type = props.type ?? 'info';
    const title = props.title ?? (type === 'info' ? 'Oznam' : type === 'question' ? 'Otázka' : 'Chyba');

    return (
        <BootstrapModal show={props.show}>
            <BootstrapModal.Header>
                <BootstrapModal.Title>{title}</BootstrapModal.Title>
            </BootstrapModal.Header>
            <BootstrapModal.Body>
                <p>{props.message}</p>
            </BootstrapModal.Body>
            <BootstrapModal.Footer>
                {type === 'question' ? (
                    <>
                        <Button
                            variant='warning'
                            onClick={() => props.onClose(false)}
                        >
                            Zrušiť
                        </Button>
                        <Button
                            variant='primary'
                            onClick={() => props.onClose(true)}
                        >
                            Potvrdiť
                        </Button>
                    </>
                ) : (
                    <Button
                        variant='primary'
                        onClick={() => props.onClose(true)}
                    >
                        Ok
                    </Button>
                )}
            </BootstrapModal.Footer>
        </BootstrapModal>
    );
};

export default Modal;
