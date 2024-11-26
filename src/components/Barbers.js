import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Tabs, Tab } from 'react-bootstrap';
import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { FaTrash, FaEdit, FaUserCircle, FaPlus } from 'react-icons/fa';
import '../styles/Barbers.css';
import ToggleSwitch from './ToggleSwitch'; 

const Barbers = () => {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [barberDetails, setBarberDetails] = useState({ fullName: '', contactNumber: '', address: '', email: '', available: false });
  const [barbers, setBarbers] = useState([]);
  const [selectedBarberId, setSelectedBarberId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [barberToDelete, setBarberToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [activeTab, setActiveTab] = useState('all-barbers');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchBarbers(user.uid);
      } else {
        setUserId(null);
        setBarbers([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchBarbers = async (uid) => {
    try {
      const barberCollection = collection(doc(db, 'users', uid), 'barbersprofile');
      const barberSnapshot = await getDocs(barberCollection);
      setBarbers(barberSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching barbers: ', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBarberDetails(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSaveBarber = async () => {
    if (!userId) return;
    try {
      const barberCollection = collection(doc(db, 'users', userId), 'barbersprofile');
      if (editing) {
        await updateDoc(doc(barberCollection, selectedBarberId), barberDetails);
        setBarbers(prev => prev.map(barber => barber.id === selectedBarberId ? { ...barber, ...barberDetails } : barber));
      } else {
        const docRef = await addDoc(barberCollection, barberDetails);
        setBarbers(prev => [...prev, { id: docRef.id, ...barberDetails }]);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving barber: ', error);
    }
  };

  const handleDeleteBarber = async () => {
    try {
      await deleteDoc(doc(db, 'users', userId, 'barbersprofile', barberToDelete));
      setBarbers(prev => prev.filter(barber => barber.id !== barberToDelete));
      setDeleteModal(false);
    } catch (error) {
      console.error('Error deleting barber: ', error);
    }
  };

  const confirmDeleteBarber = (barberId) => {
    setBarberToDelete(barberId);
    setDeleteModal(true);
  };

  const handleEditBarber = (barber) => {
    setBarberDetails(barber);
    setSelectedBarberId(barber.id);
    setEditing(true);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setBarberDetails({ fullName: '', contactNumber: '', address: '', email: '', available: false });
    setEditing(false);
    setSelectedBarberId(null);
  };

  const handleAddBarber = () => {
    resetForm();
    setShowModal(true);
  };

  // Pagination Logic
  const indexOfLastBarber = currentPage * itemsPerPage;
  const indexOfFirstBarber = indexOfLastBarber - itemsPerPage;
  const filteredBarbers = barbers.filter(barber => 
    barber.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    barber.contactNumber.includes(searchTerm) || 
    barber.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentBarbers = filteredBarbers.slice(indexOfFirstBarber, indexOfLastBarber);
  const totalPages = Math.ceil(filteredBarbers.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const availableBarbers = barbers.filter(barber => barber.available);

  return (
    <div className="barber-container">
      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-3">
        <Tab eventKey="all-barbers" title="All Barbers">
          <BarberHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleAddBarber={handleAddBarber} />
          <BarberTable 
            barbers={currentBarbers} 
            onEditBarber={handleEditBarber} 
            onConfirmDelete={confirmDeleteBarber}
            userId={userId}
            setBarbers={setBarbers}
          />
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={handlePageChange}
            filteredBarbersLength={filteredBarbers.length}
            indexOfFirstBarber={indexOfFirstBarber}
            indexOfLastBarber={indexOfLastBarber}
          />
        </Tab>
        <Tab eventKey="available-barbers" title="Available Barbers">
          <BarberHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <AvailableBarberTable barbers={availableBarbers} searchTerm={searchTerm} />
        </Tab>
      </Tabs>

      <BarberModal 
        showModal={showModal} 
        handleClose={closeModal} 
        barberDetails={barberDetails} 
        handleInputChange={handleInputChange} 
        handleSave={handleSaveBarber}
        editing={editing}
      />

      <DeleteConfirmationModal 
        showModal={deleteModal} 
        handleClose={() => setDeleteModal(false)} 
        handleDelete={handleDeleteBarber} 
      />
    </div>
  );
};

// Extracted Components

const BarberHeader = ({ searchTerm, setSearchTerm, handleAddBarber }) => (
  <div className="header-section">
    <Form.Control
      type="text"
      placeholder="Search by name, phone, or email"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="mr-2"
    />
    <Button variant="dark" onClick={handleAddBarber} className="d-flex align-items-center">
      <FaPlus className="mr-2" /> Add New Barber
    </Button>
  </div>
);

const BarberTable = ({ barbers, onEditBarber, onConfirmDelete, userId, setBarbers }) => (
  <table className="barber-table">
    <thead>
      <tr>
        <th>Status</th>
        <th>Full Name</th>
        <th>Email</th>
        <th>Phone</th>
        <th>Address</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {barbers.map((barber) => (
        <tr key={barber.id}>
          <td>
            <ToggleSwitch
              isAvailable={barber.available}
              onToggle={async () => {
                const updatedAvailability = !barber.available;
                await updateDoc(doc(db, 'users', userId, 'barbersprofile', barber.id), { available: updatedAvailability });
                setBarbers(prev => prev.map(b => b.id === barber.id ? { ...b, available: updatedAvailability } : b));
              }}
            />
          </td>
          <td><FaUserCircle className="profile-icon" /> {barber.fullName}</td>
          <td>{barber.email}</td>
          <td>{barber.contactNumber}</td>
          <td>{barber.address}</td>
          <td>
            <div className="action-buttons">
              <Button variant="warning" size="sm" onClick={() => onEditBarber(barber)} className="action-button">
                <FaEdit />
              </Button>
              <Button variant="danger" size="sm" onClick={() => onConfirmDelete(barber.id)} className="action-button">
                <FaTrash />
              </Button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const Pagination = ({ currentPage, totalPages, onPageChange, filteredBarbersLength, indexOfFirstBarber, indexOfLastBarber }) => (
  <div>
    <div className="pagination-info">
      Showing {indexOfFirstBarber + 1} to {Math.min(indexOfLastBarber, filteredBarbersLength)} out of {filteredBarbersLength} barbers
    </div>
    <div className="pagination-section">
      <ul className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <li
            key={index}
            className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
            onClick={() => onPageChange(index + 1)}
          >
            <span className="page-link">{index + 1}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const AvailableBarberTable = ({ barbers, searchTerm }) => (
  <table className="barber-table">
    <thead>
      <tr>
        <th>Full Name</th>
      </tr>
    </thead>
    <tbody>
      {barbers.filter(barber => barber.fullName.toLowerCase().includes(searchTerm.toLowerCase())).map((barber) => (
        <tr key={barber.id}>
          <td><FaUserCircle className="profile-icon" /> {barber.fullName}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const BarberModal = ({ showModal, handleClose, barberDetails, handleInputChange, handleSave, editing }) => (
  <Modal show={showModal} onHide={handleClose} className="barber-modal">
    <Modal.Header closeButton>
      <Modal.Title>{editing ? 'Edit Barber' : 'Add Barber'}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form>
        {['fullName', 'contactNumber', 'address', 'email'].map((field) => (
          <Form.Group controlId={field} key={field}>
            <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
            <Form.Control
              type={field === 'email' ? 'email' : 'text'}
              placeholder={`Enter ${field}`}
              name={field}
              value={barberDetails[field]}
              onChange={handleInputChange}
            />
          </Form.Group>
        ))}
      </Form>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="primary" onClick={handleSave}>
        Save Changes
      </Button>
    </Modal.Footer>
  </Modal>
);

const DeleteConfirmationModal = ({ showModal, handleClose, handleDelete }) => (
  <Modal show={showModal} onHide={handleClose}>
    <Modal.Header closeButton>
      <Modal.Title>Confirm Deletion</Modal.Title>
    </Modal.Header>
    <Modal.Body>Are you sure you want to delete this barber?</Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={handleClose}>Cancel</Button>
      <Button variant="danger" onClick={handleDelete}>Delete</Button>
    </Modal.Footer>
  </Modal>
);

export default Barbers;
