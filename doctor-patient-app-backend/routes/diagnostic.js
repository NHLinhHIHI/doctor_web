// routes/diagnostic.js
const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

// API endpoint to test Firestore connection and query a specific patient
router.get('/test/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    console.log('Testing diagnostic endpoint for patient ID:', patientId);
    
    // First check if the patient document exists
    const patientDoc = await db.collection('users').doc(patientId).get();
    
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      patientId,
      patientExists: patientDoc.exists,
      patientData: patientDoc.exists ? {
        hasRoleField: 'role' in patientDoc.data(),
        roleValue: patientDoc.data().role,
        hasRoleUppercaseField: 'Role' in patientDoc.data(),
        roleUppercaseValue: patientDoc.data().Role,
        dataFields: Object.keys(patientDoc.data())
      } : null,
      collections: {}
    };
    
    // If patient exists, check for subcollections
    if (patientDoc.exists) {
      // Check Profile subcollection
      try {
        const profileCollRef = db.collection('users').doc(patientId).collection('Profile');
        const profileQuery = await profileCollRef.get();
        
        response.collections.profile = {
          exists: !profileQuery.empty,
          count: profileQuery.size,
          documents: []
        };
        
        profileQuery.forEach(doc => {
          response.collections.profile.documents.push({
            id: doc.id,
            fields: Object.keys(doc.data())
          });
        });
        
        // Specifically check for HealthProfile and NormalProfile
        const healthProfileDoc = await profileCollRef.doc('HealthProfile').get();
        const normalProfileDoc = await profileCollRef.doc('NormalProfile').get();
        
        response.collections.profile.healthProfile = {
          exists: healthProfileDoc.exists,
          fields: healthProfileDoc.exists ? Object.keys(healthProfileDoc.data()) : []
        };
        
        response.collections.profile.normalProfile = {
          exists: normalProfileDoc.exists,
          fields: normalProfileDoc.exists ? Object.keys(normalProfileDoc.data()) : []
        };
      } catch (error) {
        response.collections.profile = {
          error: error.message
        };
      }
      
      // Check medical examinations
      try {
        // Try both patientId and parentId fields
        const examQuery1 = await db.collection('examinations')
          .where('patientId', '==', patientId)
          .limit(5)
          .get();
          
        const examQuery2 = await db.collection('examinations')
          .where('parentId', '==', patientId)
          .limit(5)
          .get();
          
        response.collections.examinations = {
          byPatientId: {
            exists: !examQuery1.empty,
            count: examQuery1.size
          },
          byParentId: {
            exists: !examQuery2.empty,
            count: examQuery2.size
          }
        };
      } catch (error) {
        response.collections.examinations = {
          error: error.message
        };
      }
    }
    
    res.json(response);
    
  } catch (error) {
    console.error('Error in diagnostic endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;
