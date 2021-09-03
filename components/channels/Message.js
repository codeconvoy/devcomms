import Link from 'next/link';
import Modal from '@material-ui/core/Modal';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckIcon from '@material-ui/icons/Check';

import { useEffect, useState } from 'react';
import firebase from 'firebase/app';

import styles from '../../styles/components/channels/Message.module.css';

const now = new Date();
const nowDay = now.getDate();
const nowMonth = now.getMonth();
const nowYear = now.getFullYear();
const today = new Date(nowYear, nowMonth, nowDay).setHours(0, 0, 0, 0);
const yesterday = new Date(nowYear, nowMonth, nowDay - 1).setHours(0, 0, 0, 0);

export default function Message(props) {
  const { showHeader, messagesRef, scroll, message } = props;

  const [modalOpen, setModalOpen] = useState(false);
  const [newText, setNewText] = useState(message.text);

  const uid = firebase.auth().currentUser.uid;

  // retrieve message ref
  const messageRef = messagesRef.doc(message.id);

  // deletes message
  async function deleteMessage() {
    if (window.confirm('Really delete message?')) {
      setModalOpen(false);
      await messageRef.delete();
    }
  }

  // updates message in firebase
  async function updateMessage() {
    setModalOpen(false);
    if (message.text === newText) return;
    await messageRef.update({
      text: newText,
      edited: true
    });
  }

  // resets modal
  function resetModal() {
    setNewText(message.text);
  }

  // returns a datetime string for given datetime
  function getDateTimeString(dateTime) {
    // separate time and date
    const time = dateTime.toLocaleTimeString([], { timeStyle: 'short' });
    const date = dateTime.setHours(0, 0, 0, 0);
    if (date === today) return `${time} today`; // today
    else if (date === yesterday) return `${time} yesterday`; // yesterday
    else return dateTime.toLocaleDateString(); // past
  }

  return (
    <>
      {
        showHeader &&
        <span className={styles.header}>
          @{message.username}
          {' '}
          <span className={styles.datetime}>
            {getDateTimeString(message.sent.toDate())}
          </span>
        </span>
      }
      <div className={styles.container}>
        {
          message.type === 'text' ?
          <span>
            {message.text}
            {message.edited && <span className={styles.edited}> (edited)</span>}
          </span> :
          <a href={props.message.url} target="_blank" rel="noreferrer noopener">
            {
              message.type === 'image' ?
              // using an img element here because of unknown size
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={props.message.url}
                className={styles.image}
                alt={props.message.filename}
                onLoad={scroll}
              /> :
              props.message.filename
            }
          </a>
        }
        {
          uid === message.sender &&
          <button onClick={() => {
            resetModal();
            setModalOpen(true);
          }}>
            <EditIcon fontSize="small" />
          </button>
        }
      </div>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <div className="modal">
          <h1>Editing Message</h1>
          {
            message.type === 'text' &&
            <form onSubmit={e => {
              e.preventDefault();
              updateMessage();
            }}>
              <input
                value={newText}
                onChange={e => setNewText(e.target.value)}
                className={`${styles.textinput} darkinput`}
                required
              />
              <button className={`${styles.checkbutton} iconbutton2`}>
                <CheckIcon />
              </button>
            </form>
          }
          <button className="iconbutton2" onClick={deleteMessage}>
            <DeleteIcon />
          </button>
        </div>
      </Modal>
    </>
  );
}
