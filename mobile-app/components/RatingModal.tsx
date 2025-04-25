import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';


interface RatingModalProps {
 visible: boolean;
 onConfirm: (rating: number) => void;
 onClose: () => void;
}


const RatingModal: React.FC<RatingModalProps> = ({ visible, onConfirm, onClose }) => {
 const [rating, setRating] = useState(0);


 const renderStar = (index: number) => {
   // Filled star if rating is greater or equal to the index; empty otherwise.
   const star = rating >= index ? '★' : '☆';
   return (
     <TouchableOpacity key={index} onPress={() => setRating(index)} style={styles.star}>
       <Text style={styles.starText}>{star}</Text>
     </TouchableOpacity>
   );
 };


 return (
   <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
     <View style={styles.modalOverlay}>
       <View style={styles.modalContent}>
         <Text style={styles.modalTitle}>Rate This Court</Text>
         <View style={styles.starsContainer}>
           {[1, 2, 3, 4, 5].map(renderStar)}
         </View>
         <TouchableOpacity
           style={[styles.confirmButton, rating === 0 && styles.disabledButton]}
           onPress={() => { if (rating !== 0) onConfirm(rating); }}
           disabled={rating === 0}
         >
           <Text style={styles.buttonText}>Confirm</Text>
         </TouchableOpacity>
         <TouchableOpacity style={styles.closeButton} onPress={onClose}>
           <Text style={styles.buttonText}>Close</Text>
         </TouchableOpacity>
       </View>
     </View>
   </Modal>
 );
};


export default RatingModal;


const styles = StyleSheet.create({
 modalOverlay: {
   flex: 1,
   backgroundColor: 'rgba(0,0,0,0.6)',
   justifyContent: 'center',
   alignItems: 'center',
 },
 modalContent: {
   width: '80%',
   backgroundColor: '#fff',
   borderRadius: 8,
   padding: 20,
   alignItems: 'center',
 },
 modalTitle: {
   fontSize: 20,
   marginBottom: 20,
 },
 starsContainer: {
   flexDirection: 'row',
   marginBottom: 20,
 },
 star: {
   marginHorizontal: 5,
 },
 starText: {
   fontSize: 40,
   color: '#FFD700',
 },
 confirmButton: {
   backgroundColor: '#007bff',
   paddingVertical: 10,
   paddingHorizontal: 20,
   borderRadius: 5,
   marginBottom: 10,
 },
 disabledButton: {
   backgroundColor: '#aaa',
 },
 closeButton: {
   backgroundColor: '#ccc',
   paddingVertical: 10,
   paddingHorizontal: 20,
   borderRadius: 5,
 },
 buttonText: {
   color: '#fff',
   fontWeight: 'bold',
 },
});
