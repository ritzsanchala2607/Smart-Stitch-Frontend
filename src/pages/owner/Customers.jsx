import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import { UserPlus, X, Upload, CheckCircle, Search, Eye, EyeOff, AlertCircle, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { validateCustomerForm } from '../../utils/validation';
import CustomerCard from '../../components/common/CustomerCard';
import { customerAPI, orderAPI } from '../../services/api';
import MeasurementInputs from '../../components/common/MeasurementInputs';

const Customers = () => {
  usePageTitle('Customers');
  const [customers, setCustomers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', description: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [measurementProfiles, setMeasurementProfiles] = useState([]);
  const [isLoadingMeasurements, setIsLoadingMeasurements] = useState(false);
  
  const [customerForm, setCustomerForm] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    measurements: {
      pant: { length: '', waist: '', seatHips: '', knee: '', bottomOpening: '', thighCircumference: '', thigh: '' },
      shirt: { length: '', chest: '', waist: '', shoulder: '', sleeveLength: '', armhole: '', collar: '' },
      coat: { length: '', chest: '', waist: '', shoulder: '', sleeveLength: '', armhole: '' },
      kurta: { length: '', chest: '', waist: '', seatHips: '', flare: '', shoulder: '', armhole: '', sleeve: '', bottomOpening: '', frontNeck: '', backNeck: '' },
      dhoti: { length: '', waist: '', hip: '', sideLength: '', foldLength: '' },
      custom: ''
    },
    photo: null
  });

  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent double-click submissions
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Fetch customers from API
  const fetchCustomers = async () => {
    setIsLoading(true);
    setFetchError(null);

    // Get token
    let token = localStorage.getItem('token');
    if (!token) {
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          token = userData.jwt || userData.token;
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }

    if (!token) {
      setFetchError('Authentication required. Please login again.');
      setIsLoading(false);
      return;
    }

    try {
      // Fetch customers first - this is fast
      const result = await customerAPI.getCustomers(token);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch customers');
      }

      console.log('Customers fetched:', result.data);

      // Map customers immediately with default stats (0 orders, $0 spent)
      // This makes the UI responsive immediately
      const mappedCustomers = (result.data || []).map(customer => {
        const userId = customer.user?.userId || customer.userId;
        const customerId = customer.customerId || customer.id;
        
        return {
          id: customerId,
          userId: userId,
          name: customer.user?.name || customer.name,
          email: customer.user?.email || customer.email,
          phone: customer.user?.contactNumber || customer.phone,
          address: '',
          joinDate: customer.createdAt ? new Date(customer.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          totalOrders: 0, // Default to 0, will update later
          totalSpent: 0,  // Default to 0, will update later
          measurements: {
            pant: {
              length: customer.measurements?.pantLength || '',
              waist: customer.measurements?.pantWaist || '',
              seatHips: customer.measurements?.seatHips || customer.measurements?.seatHip || '',
              thigh: customer.measurements?.thigh || '',
              knee: customer.measurements?.knee || '',
              bottomOpening: customer.measurements?.bottomOpening || customer.measurements?.bottom || '',
              thighCircumference: customer.measurements?.thighCircumference || ''
            },
            shirt: {
              length: customer.measurements?.shirtLength || '',
              chest: customer.measurements?.chest || '',
              waist: customer.measurements?.shirtWaist || '',
              shoulder: customer.measurements?.shoulder || '',
              sleeveLength: customer.measurements?.sleeveLength || '',
              armhole: customer.measurements?.armhole || '',
              collar: customer.measurements?.collar || ''
            },
            coat: {
              length: customer.measurements?.coatLength || '',
              chest: customer.measurements?.coatChest || '',
              waist: customer.measurements?.coatWaist || '',
              shoulder: customer.measurements?.coatShoulder || '',
              sleeveLength: customer.measurements?.coatSleeveLength || '',
              armhole: customer.measurements?.coatArmhole || ''
            },
            kurta: {
              length: customer.measurements?.kurtaLength || '',
              chest: customer.measurements?.kurtaChest || '',
              waist: customer.measurements?.kurtaWaist || '',
              seatHips: customer.measurements?.kurtaSeatHips || customer.measurements?.kurtaHip || '',
              flare: customer.measurements?.kurtaFlare || '',
              shoulder: customer.measurements?.kurtaShoulder || '',
              armhole: customer.measurements?.kurtaArmhole || '',
              sleeve: customer.measurements?.kurtaSleeve || customer.measurements?.kurtaSleeveLength || '',
              bottomOpening: customer.measurements?.kurtaBottomOpening || '',
              frontNeck: customer.measurements?.kurtaFrontNeck || '',
              backNeck: customer.measurements?.kurtaBackNeck || ''
            },
            dhoti: {
              length: customer.measurements?.dhotiLength || '',
              waist: customer.measurements?.dhotiWaist || '',
              hip: customer.measurements?.dhotiHip || '',
              sideLength: customer.measurements?.sideLength || '',
              foldLength: customer.measurements?.foldLength || ''
            },
            custom: customer.measurements?.customMeasurements || ''
          },
          avatar: customer.user?.profilePicture || null
        };
      });
        
      // Set customers immediately so UI shows quickly
      setCustomers(mappedCustomers);
      setIsLoading(false); // Stop loading spinner here!

      // Fetch orders in background to update stats (non-blocking)
      // This happens after the UI is already showing
      orderAPI.getOrders(token).then(ordersResult => {
        if (ordersResult.success) {
          const orders = ordersResult.data || [];
          console.log('Orders fetched for stats (background):', orders.length, 'orders');

          // Calculate stats for each customer
          const customerStats = {};
          orders.forEach(order => {
            const customerId = order.customer?.customerId || order.customerId;
            if (!customerId) return;

            if (!customerStats[customerId]) {
              customerStats[customerId] = {
                totalOrders: 0,
                totalSpent: 0
              };
            }

            customerStats[customerId].totalOrders++;
            customerStats[customerId].totalSpent += order.totalPrice || 0;
          });

          console.log('Customer stats calculated:', customerStats);

          // Update customers with stats
          setCustomers(prevCustomers => 
            prevCustomers.map(customer => ({
              ...customer,
              totalOrders: customerStats[customer.id]?.totalOrders || 0,
              totalSpent: customerStats[customer.id]?.totalSpent || 0
            }))
          );
        }
      }).catch(error => {
        console.error('Error fetching order stats (non-critical):', error);
        // Don't show error to user - stats just stay at 0
      });

    } catch (error) {
      console.error('Error fetching customers:', error);
      setFetchError('Failed to load customers. Please try again.');
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setCustomerForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleMeasurementChange = (type, field, value) => {
    setCustomerForm(prev => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [type]: typeof prev.measurements[type] === 'object' 
          ? { ...prev.measurements[type], [field]: value }
          : value
      }
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          photo: 'Please upload a valid image file (JPG, PNG, or GIF)'
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          photo: 'File size must be less than 5MB'
        }));
        return;
      }

      setCustomerForm(prev => ({
        ...prev,
        photo: file
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      setErrors(prev => ({
        ...prev,
        photo: ''
      }));
    }
  };

  const handleRemovePhoto = () => {
    setCustomerForm(prev => ({
      ...prev,
      photo: null
    }));
    setPhotoPreview(null);
  };

  const handleAddCustomer = async () => {
    // Prevent double submission
    if (isSubmitting) {
      console.log('Submission already in progress, ignoring duplicate click');
      return;
    }

    const validation = validateCustomerForm(customerForm);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Get JWT token
    let token = localStorage.getItem('token');
    if (!token) {
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          token = userData.jwt || userData.token;
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }

    if (!token) {
      setErrors({ api: 'User not authenticated. Please login again.' });
      return;
    }

    // Set submitting state to disable button
    setIsSubmitting(true);

    try {
      // Step 1: Create customer WITHOUT measurements (new API approach)
      const customerPayload = {
        user: {
          name: customerForm.name,
          email: customerForm.email,
          password: customerForm.password || 'Customer@123',
          contactNumber: customerForm.mobile,
          roleId: 3
        }
        // Note: measurements field removed - will be created separately
      };

      console.log('Step 1: Creating customer without measurements:', customerPayload);

      const customerResult = await customerAPI.addCustomer(customerPayload, token);

      console.log('Customer API Result:', customerResult);

      if (!customerResult.success) {
        if (customerResult.error.includes('403')) {
          throw new Error('Access denied. Please ensure you are logged in as a shop owner.');
        }
        throw new Error(customerResult.error);
      }

      console.log('Customer created successfully:', customerResult.data);

      // Get the created customer ID
      const customerId = customerResult.data.customerId || customerResult.data.id;

      if (!customerId) {
        console.error('Customer ID not found in response:', customerResult.data);
        throw new Error('Customer created but ID not returned from server');
      }

      console.log('Customer ID:', customerId);

      // Step 2: Create measurement profiles for each dress type that has data
      const measurementProfiles = [];
      let successfulProfiles = 0;
      let failedProfiles = 0;

      // Pant measurements
      if (Object.values(customerForm.measurements.pant).some(v => v)) {
        const pantMeasurements = {
          customerId: customerId,
          dressType: 'PANT',
          notes: 'Initial measurements',
          measurements: {}
        };
        
        if (customerForm.measurements.pant.waist) pantMeasurements.measurements.waist = parseFloat(customerForm.measurements.pant.waist);
        if (customerForm.measurements.pant.length) pantMeasurements.measurements.length = parseFloat(customerForm.measurements.pant.length);
        if (customerForm.measurements.pant.seatHips) pantMeasurements.measurements.hip = parseFloat(customerForm.measurements.pant.seatHips);
        if (customerForm.measurements.pant.thigh) pantMeasurements.measurements.thigh = parseFloat(customerForm.measurements.pant.thigh);
        if (customerForm.measurements.pant.knee) pantMeasurements.measurements.knee = parseFloat(customerForm.measurements.pant.knee);
        if (customerForm.measurements.pant.bottomOpening) pantMeasurements.measurements.bottom = parseFloat(customerForm.measurements.pant.bottomOpening);
        if (customerForm.measurements.pant.thighCircumference) pantMeasurements.measurements.thighCircumference = parseFloat(customerForm.measurements.pant.thighCircumference);
        
        measurementProfiles.push(pantMeasurements);
      }

      // Shirt measurements
      if (Object.values(customerForm.measurements.shirt).some(v => v)) {
        const shirtMeasurements = {
          customerId: customerId,
          dressType: 'SHIRT',
          notes: 'Initial measurements',
          measurements: {}
        };
        
        if (customerForm.measurements.shirt.chest) shirtMeasurements.measurements.chest = parseFloat(customerForm.measurements.shirt.chest);
        if (customerForm.measurements.shirt.shoulder) shirtMeasurements.measurements.shoulder = parseFloat(customerForm.measurements.shirt.shoulder);
        if (customerForm.measurements.shirt.length) shirtMeasurements.measurements.length = parseFloat(customerForm.measurements.shirt.length);
        if (customerForm.measurements.shirt.sleeveLength) shirtMeasurements.measurements.sleeve = parseFloat(customerForm.measurements.shirt.sleeveLength);
        if (customerForm.measurements.shirt.waist) shirtMeasurements.measurements.waist = parseFloat(customerForm.measurements.shirt.waist);
        if (customerForm.measurements.shirt.armhole) shirtMeasurements.measurements.armhole = parseFloat(customerForm.measurements.shirt.armhole);
        if (customerForm.measurements.shirt.collar) shirtMeasurements.measurements.collar = parseFloat(customerForm.measurements.shirt.collar);
        
        measurementProfiles.push(shirtMeasurements);
      }

      // Coat measurements
      if (Object.values(customerForm.measurements.coat).some(v => v)) {
        const coatMeasurements = {
          customerId: customerId,
          dressType: 'COAT',
          notes: 'Initial measurements',
          measurements: {}
        };
        
        if (customerForm.measurements.coat.chest) coatMeasurements.measurements.chest = parseFloat(customerForm.measurements.coat.chest);
        if (customerForm.measurements.coat.shoulder) coatMeasurements.measurements.shoulder = parseFloat(customerForm.measurements.coat.shoulder);
        if (customerForm.measurements.coat.length) coatMeasurements.measurements.length = parseFloat(customerForm.measurements.coat.length);
        if (customerForm.measurements.coat.sleeveLength) coatMeasurements.measurements.sleeve = parseFloat(customerForm.measurements.coat.sleeveLength);
        if (customerForm.measurements.coat.waist) coatMeasurements.measurements.waist = parseFloat(customerForm.measurements.coat.waist);
        if (customerForm.measurements.coat.armhole) coatMeasurements.measurements.armhole = parseFloat(customerForm.measurements.coat.armhole);
        
        measurementProfiles.push(coatMeasurements);
      }

      // Kurta measurements
      if (Object.values(customerForm.measurements.kurta).some(v => v)) {
        const kurtaMeasurements = {
          customerId: customerId,
          dressType: 'KURTA',
          notes: 'Initial measurements',
          measurements: {}
        };
        
        if (customerForm.measurements.kurta.length) kurtaMeasurements.measurements.length = parseFloat(customerForm.measurements.kurta.length);
        if (customerForm.measurements.kurta.chest) kurtaMeasurements.measurements.chest = parseFloat(customerForm.measurements.kurta.chest);
        if (customerForm.measurements.kurta.waist) kurtaMeasurements.measurements.waist = parseFloat(customerForm.measurements.kurta.waist);
        if (customerForm.measurements.kurta.seatHips) kurtaMeasurements.measurements.hip = parseFloat(customerForm.measurements.kurta.seatHips);
        if (customerForm.measurements.kurta.flare) kurtaMeasurements.measurements.flare = parseFloat(customerForm.measurements.kurta.flare);
        if (customerForm.measurements.kurta.shoulder) kurtaMeasurements.measurements.shoulder = parseFloat(customerForm.measurements.kurta.shoulder);
        if (customerForm.measurements.kurta.armhole) kurtaMeasurements.measurements.armhole = parseFloat(customerForm.measurements.kurta.armhole);
        if (customerForm.measurements.kurta.sleeve) kurtaMeasurements.measurements.sleeve = parseFloat(customerForm.measurements.kurta.sleeve);
        if (customerForm.measurements.kurta.bottomOpening) kurtaMeasurements.measurements.bottomOpening = parseFloat(customerForm.measurements.kurta.bottomOpening);
        if (customerForm.measurements.kurta.frontNeck) kurtaMeasurements.measurements.frontNeck = parseFloat(customerForm.measurements.kurta.frontNeck);
        if (customerForm.measurements.kurta.backNeck) kurtaMeasurements.measurements.backNeck = parseFloat(customerForm.measurements.kurta.backNeck);
        
        measurementProfiles.push(kurtaMeasurements);
      }

      // Dhoti measurements
      if (Object.values(customerForm.measurements.dhoti).some(v => v)) {
        const dhotiMeasurements = {
          customerId: customerId,
          dressType: 'DHOTI',
          notes: 'Initial measurements',
          measurements: {}
        };
        
        if (customerForm.measurements.dhoti.waist) dhotiMeasurements.measurements.waist = parseFloat(customerForm.measurements.dhoti.waist);
        if (customerForm.measurements.dhoti.length) dhotiMeasurements.measurements.length = parseFloat(customerForm.measurements.dhoti.length);
        if (customerForm.measurements.dhoti.hip) dhotiMeasurements.measurements.hip = parseFloat(customerForm.measurements.dhoti.hip);
        if (customerForm.measurements.dhoti.sideLength) dhotiMeasurements.measurements.sideLength = parseFloat(customerForm.measurements.dhoti.sideLength);
        if (customerForm.measurements.dhoti.foldLength) dhotiMeasurements.measurements.foldLength = parseFloat(customerForm.measurements.dhoti.foldLength);
        
        measurementProfiles.push(dhotiMeasurements);
      }

      // Custom measurements
      if (customerForm.measurements.custom) {
        const customMeasurements = {
          customerId: customerId,
          dressType: 'CUSTOM',
          notes: customerForm.measurements.custom,
          measurements: {}
        };
        measurementProfiles.push(customMeasurements);
      }

      // Step 3: Create all measurement profiles
      console.log(`Step 2: Creating ${measurementProfiles.length} measurement profiles...`);
      
      for (const profile of measurementProfiles) {
        console.log(`Creating ${profile.dressType} profile:`, profile);
        const measurementResult = await customerAPI.createMeasurementProfile(profile, token);
        
        if (!measurementResult.success) {
          console.error(`Failed to create ${profile.dressType} measurement profile:`, measurementResult.error);
          failedProfiles++;
        } else {
          console.log(`${profile.dressType} measurement profile created successfully`);
          successfulProfiles++;
        }
      }

      // Refresh the customers list from the backend
      await fetchCustomers();

      const profileMessage = measurementProfiles.length > 0 
        ? `Customer created with ${successfulProfiles} measurement profile(s).${failedProfiles > 0 ? ` (${failedProfiles} failed)` : ''}`
        : 'Customer created successfully.';

      setSuccessMessage({
        title: 'Customer Added Successfully!',
        description: profileMessage
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);

      // Reset form and close modal
      setCustomerForm({
        name: '',
        mobile: '',
        email: '',
        password: '',
        measurements: {
          pant: { length: '', waist: '', seatHips: '', knee: '', bottomOpening: '', thighCircumference: '', thigh: '' },
          shirt: { length: '', chest: '', waist: '', shoulder: '', sleeveLength: '', armhole: '', collar: '' },
          coat: { length: '', chest: '', waist: '', shoulder: '', sleeveLength: '', armhole: '' },
          kurta: { length: '', chest: '', waist: '', seatHips: '', flare: '', shoulder: '', armhole: '', sleeve: '', bottomOpening: '', frontNeck: '', backNeck: '' },
          dhoti: { length: '', waist: '', hip: '', sideLength: '', foldLength: '' },
          custom: ''
        },
        photo: null
      });
      setPhotoPreview(null);
      setErrors({});
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating customer:', error);
      setErrors({ api: error.message || 'Failed to create customer' });
    } finally {
      // Always reset submitting state, even if there's an error
      setIsSubmitting(false);
    }
  };

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomerForView, setSelectedCustomerForView] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const handleView = async (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    setSelectedCustomerForView(customer);
    setShowViewModal(true);
    
    // Fetch measurement profiles for this customer
    setIsLoadingMeasurements(true);
    setMeasurementProfiles([]);
    
    // Get token
    let token = localStorage.getItem('token');
    if (!token) {
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          token = userData.jwt || userData.token;
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }

    if (token && customer) {
      try {
        console.log('=== Fetching Measurements ===');
        console.log('Customer ID:', customer.id);
        
        // Try the new endpoint first (if backend has deployed it)
        let result = await customerAPI.getMeasurementProfilesByCustomerId(customer.id, token);
        
        // If new endpoint doesn't exist, try the old endpoint with customerId
        if (!result.success && result.error.includes('No static resource')) {
          console.log('New endpoint not available, trying original endpoint with customerId...');
          result = await customerAPI.getMeasurementProfiles(customer.id, token);
        }
        
        console.log('API Result:', result);
        
        if (result.success) {
          console.log('✓ Measurement profiles fetched successfully:', result.data);
          setMeasurementProfiles(result.data || []);
        } else {
          console.error('✗ Failed to fetch measurement profiles:', result.error);
          setMeasurementProfiles([]);
        }
      } catch (error) {
        console.error('✗ Error fetching measurement profiles:', error);
        setMeasurementProfiles([]);
      }
    } else {
      console.error('Missing token or customer data');
    }
    
    setIsLoadingMeasurements(false);
  };

  const handleEdit = async (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    setEditingCustomer(customer);
    
    // Pre-fill form with customer basic data
    setCustomerForm({
      name: customer.name,
      mobile: customer.phone,
      email: customer.email,
      password: '', // Don't pre-fill password
      measurements: {
        pant: { length: '', waist: '', seatHips: '', knee: '', bottomOpening: '', thighCircumference: '', thigh: '' },
        shirt: { length: '', chest: '', waist: '', shoulder: '', sleeveLength: '', armhole: '', collar: '' },
        coat: { length: '', chest: '', waist: '', shoulder: '', sleeveLength: '', armhole: '' },
        kurta: { length: '', chest: '', waist: '', seatHips: '', flare: '', shoulder: '', armhole: '', sleeve: '', bottomOpening: '', frontNeck: '', backNeck: '' },
        dhoti: { length: '', waist: '', hip: '', sideLength: '', foldLength: '' },
        custom: ''
      },
      photo: null
    });
    
    // Set photo preview if customer has avatar
    if (customer.avatar) {
      setPhotoPreview(customer.avatar);
    }
    
    setShowEditModal(true);
    
    // Fetch measurement profiles for this customer
    setIsLoadingMeasurements(true);
    setMeasurementProfiles([]);
    
    // Get token
    let token = localStorage.getItem('token');
    if (!token) {
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          token = userData.jwt || userData.token;
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }

    if (token && customerId) {
      try {
        // Try the new endpoint first (if backend has deployed it)
        let result = await customerAPI.getMeasurementProfilesByCustomerId(customerId, token);
        
        // If new endpoint doesn't exist, try the old endpoint with customerId
        if (!result.success && result.error.includes('No static resource')) {
          console.log('New endpoint not available, trying original endpoint with customerId...');
          result = await customerAPI.getMeasurementProfiles(customerId, token);
        }
        
        if (result.success) {
          console.log('Measurement profiles fetched for editing:', result.data);
          setMeasurementProfiles(result.data || []);
          
          // Pre-fill form with existing measurements
          const profiles = result.data || [];
          const updatedMeasurements = { ...customerForm.measurements };
          
          profiles.forEach(profile => {
            const measurements = profile.measurements || {};
            
            switch (profile.dressType) {
              case 'PANT':
                updatedMeasurements.pant = {
                  length: measurements.length || '',
                  waist: measurements.waist || '',
                  seatHips: measurements.hip || '',
                  thigh: measurements.thigh || '',
                  knee: measurements.knee || '',
                  bottomOpening: measurements.bottom || '',
                  thighCircumference: measurements.thighCircumference || ''
                };
                break;
              case 'SHIRT':
                updatedMeasurements.shirt = {
                  length: measurements.length || '',
                  chest: measurements.chest || '',
                  waist: measurements.waist || '',
                  shoulder: measurements.shoulder || '',
                  sleeveLength: measurements.sleeve || '',
                  armhole: measurements.armhole || '',
                  collar: measurements.collar || ''
                };
                break;
              case 'COAT':
                updatedMeasurements.coat = {
                  length: measurements.length || '',
                  chest: measurements.chest || '',
                  waist: measurements.waist || '',
                  shoulder: measurements.shoulder || '',
                  sleeveLength: measurements.sleeve || '',
                  armhole: measurements.armhole || ''
                };
                break;
              case 'KURTA':
                updatedMeasurements.kurta = {
                  length: measurements.length || '',
                  chest: measurements.chest || '',
                  waist: measurements.waist || '',
                  seatHips: measurements.hip || '',
                  flare: measurements.flare || '',
                  shoulder: measurements.shoulder || '',
                  armhole: measurements.armhole || '',
                  sleeve: measurements.sleeve || '',
                  bottomOpening: measurements.bottomopening || measurements.bottomOpening || '',
                  frontNeck: measurements.frontneck || measurements.frontNeck || '',
                  backNeck: measurements.backneck || measurements.backNeck || ''
                };
                break;
              case 'DHOTI':
                updatedMeasurements.dhoti = {
                  length: measurements.length || '',
                  waist: measurements.waist || '',
                  hip: measurements.hip || '',
                  sideLength: measurements.sideLength || '',
                  foldLength: measurements.foldLength || ''
                };
                break;
              case 'CUSTOM':
                updatedMeasurements.custom = profile.notes || '';
                break;
            }
          });
          
          setCustomerForm(prev => ({
            ...prev,
            measurements: updatedMeasurements
          }));
        } else {
          console.error('Failed to fetch measurement profiles:', result.error);
          setMeasurementProfiles([]);
        }
      } catch (error) {
        console.error('Error fetching measurement profiles:', error);
        setMeasurementProfiles([]);
      }
    }
    
    setIsLoadingMeasurements(false);
  };

  const handleUpdateCustomer = async () => {
    // Get JWT token
    let token = localStorage.getItem('token');
    if (!token) {
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          token = userData.jwt || userData.token;
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }

    if (!token) {
      setErrors({ api: 'User not authenticated. Please login again.' });
      return;
    }

    try {
      console.log('Updating customer:', editingCustomer.id);
      
      // Step 1: Update customer personal information (name, mobile, email)
      const hasPersonalInfoChanges = 
        customerForm.name !== editingCustomer.name ||
        customerForm.mobile !== editingCustomer.mobile ||
        customerForm.email !== editingCustomer.email;

      if (hasPersonalInfoChanges) {
        console.log('Updating customer personal information...');
        
        const customerUpdatePayload = {
          user: {
            name: customerForm.name,
            contactNumber: customerForm.mobile,
            // Note: Email updates might not be allowed by backend
          }
        };

        const customerUpdateResult = await customerAPI.updateCustomer(
          editingCustomer.id,
          customerUpdatePayload,
          token
        );

        if (!customerUpdateResult.success) {
          throw new Error(customerUpdateResult.error || 'Failed to update customer information');
        }

        console.log('Customer personal information updated successfully');
      }

      // Step 2: Update measurement profiles
      let updatedProfiles = 0;
      let createdProfiles = 0;
      let failedProfiles = 0;

      // Helper function to check if measurements exist for a dress type
      const hasMeasurements = (measurements) => {
        return Object.values(measurements).some(v => v !== '' && v !== null && v !== undefined);
      };

      // Update or create measurement profiles for each dress type
      const dressTypes = [
        {
          type: 'PANT',
          formData: customerForm.measurements.pant,
          apiData: {
            waist: parseFloat(customerForm.measurements.pant.waist) || undefined,
            length: parseFloat(customerForm.measurements.pant.length) || undefined,
            hip: parseFloat(customerForm.measurements.pant.seatHips) || undefined,
            thigh: parseFloat(customerForm.measurements.pant.thigh) || undefined,
            knee: parseFloat(customerForm.measurements.pant.knee) || undefined,
            bottom: parseFloat(customerForm.measurements.pant.bottomOpening) || undefined,
            thighCircumference: parseFloat(customerForm.measurements.pant.thighCircumference) || undefined
          }
        },
        {
          type: 'SHIRT',
          formData: customerForm.measurements.shirt,
          apiData: {
            chest: parseFloat(customerForm.measurements.shirt.chest) || undefined,
            shoulder: parseFloat(customerForm.measurements.shirt.shoulder) || undefined,
            length: parseFloat(customerForm.measurements.shirt.length) || undefined,
            sleeve: parseFloat(customerForm.measurements.shirt.sleeveLength) || undefined,
            waist: parseFloat(customerForm.measurements.shirt.waist) || undefined,
            armhole: parseFloat(customerForm.measurements.shirt.armhole) || undefined,
            collar: parseFloat(customerForm.measurements.shirt.collar) || undefined
          }
        },
        {
          type: 'COAT',
          formData: customerForm.measurements.coat,
          apiData: {
            chest: parseFloat(customerForm.measurements.coat.chest) || undefined,
            shoulder: parseFloat(customerForm.measurements.coat.shoulder) || undefined,
            length: parseFloat(customerForm.measurements.coat.length) || undefined,
            sleeve: parseFloat(customerForm.measurements.coat.sleeveLength) || undefined,
            waist: parseFloat(customerForm.measurements.coat.waist) || undefined,
            armhole: parseFloat(customerForm.measurements.coat.armhole) || undefined
          }
        },
        {
          type: 'KURTA',
          formData: customerForm.measurements.kurta,
          apiData: {
            length: parseFloat(customerForm.measurements.kurta.length) || undefined,
            chest: parseFloat(customerForm.measurements.kurta.chest) || undefined,
            waist: parseFloat(customerForm.measurements.kurta.waist) || undefined,
            hip: parseFloat(customerForm.measurements.kurta.seatHips) || undefined,
            flare: parseFloat(customerForm.measurements.kurta.flare) || undefined,
            shoulder: parseFloat(customerForm.measurements.kurta.shoulder) || undefined,
            armhole: parseFloat(customerForm.measurements.kurta.armhole) || undefined,
            sleeve: parseFloat(customerForm.measurements.kurta.sleeve) || undefined,
            bottomOpening: parseFloat(customerForm.measurements.kurta.bottomOpening) || undefined,
            frontNeck: parseFloat(customerForm.measurements.kurta.frontNeck) || undefined,
            backNeck: parseFloat(customerForm.measurements.kurta.backNeck) || undefined
          }
        },
        {
          type: 'DHOTI',
          formData: customerForm.measurements.dhoti,
          apiData: {
            waist: parseFloat(customerForm.measurements.dhoti.waist) || undefined,
            length: parseFloat(customerForm.measurements.dhoti.length) || undefined,
            hip: parseFloat(customerForm.measurements.dhoti.hip) || undefined,
            sideLength: parseFloat(customerForm.measurements.dhoti.sideLength) || undefined,
            foldLength: parseFloat(customerForm.measurements.dhoti.foldLength) || undefined
          }
        }
      ];

      // Process each dress type
      for (const dressType of dressTypes) {
        if (!hasMeasurements(dressType.formData)) {
          continue; // Skip if no measurements
        }

        // Remove undefined values from apiData
        const cleanedData = Object.fromEntries(
          Object.entries(dressType.apiData).filter(([_, v]) => v !== undefined)
        );

        // Find existing profile for this dress type
        const existingProfile = measurementProfiles.find(p => p.dressType === dressType.type);

        if (existingProfile) {
          // Update existing profile - only send notes and measurements
          const updatePayload = {
            notes: 'Updated measurements',
            measurements: cleanedData
          };

          console.log(`Updating ${dressType.type} profile (ID: ${existingProfile.profileId}):`, updatePayload);

          const result = await customerAPI.updateMeasurementProfile(existingProfile.profileId, updatePayload, token);

          if (result.success) {
            console.log(`${dressType.type} profile updated successfully`);
            updatedProfiles++;
          } else {
            console.error(`Failed to update ${dressType.type} profile:`, result.error);
            failedProfiles++;
          }
        } else {
          // Create new profile
          const createPayload = {
            customerId: editingCustomer.id,
            dressType: dressType.type,
            notes: 'Initial measurements',
            measurements: cleanedData
          };

          console.log(`Creating new ${dressType.type} profile:`, createPayload);

          const result = await customerAPI.createMeasurementProfile(createPayload, token);

          if (result.success) {
            console.log(`${dressType.type} profile created successfully`);
            createdProfiles++;
          } else {
            console.error(`Failed to create ${dressType.type} profile:`, result.error);
            failedProfiles++;
          }
        }
      }

      // Handle custom measurements
      if (customerForm.measurements.custom) {
        const existingCustomProfile = measurementProfiles.find(p => p.dressType === 'CUSTOM');

        if (existingCustomProfile) {
          const result = await customerAPI.updateMeasurementProfile(
            existingCustomProfile.profileId,
            { 
              notes: customerForm.measurements.custom, 
              measurements: {} 
            },
            token
          );
          if (result.success) updatedProfiles++;
          else failedProfiles++;
        } else {
          const result = await customerAPI.createMeasurementProfile(
            {
              customerId: editingCustomer.id,
              dressType: 'CUSTOM',
              notes: customerForm.measurements.custom,
              measurements: {}
            },
            token
          );
          if (result.success) createdProfiles++;
          else failedProfiles++;
        }
      }

      // Refresh the customers list from the backend
      await fetchCustomers();

      if (failedProfiles > 0) {
        // Show partial success with warning
        const message = `${hasPersonalInfoChanges ? 'Personal information updated. ' : ''}Updated ${updatedProfiles} measurement profile(s), created ${createdProfiles} new profile(s). ${failedProfiles} profile(s) failed to update.`;
        
        setErrors({ 
          api: `${message}\n\nNote: If you're seeing duplicate key errors, this is a known backend issue. The backend needs to be updated to properly handle measurement updates. Please contact the backend team.` 
        });
      } else {
        const personalInfoMsg = hasPersonalInfoChanges ? 'Personal information updated. ' : '';
        const measurementMsg = `Updated ${updatedProfiles} measurement profile(s), created ${createdProfiles} new profile(s).`;
        const message = personalInfoMsg + measurementMsg;

        setSuccessMessage({
          title: 'Customer Updated Successfully!',
          description: message
        });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);

        // Reset form and close modal
        setCustomerForm({
          name: '',
          mobile: '',
          email: '',
          password: '',
          measurements: {
            pant: { length: '', waist: '', seatHips: '', knee: '', bottomOpening: '', thighCircumference: '', thigh: '' },
            shirt: { length: '', chest: '', waist: '', shoulder: '', sleeveLength: '', armhole: '', collar: '' },
            coat: { length: '', chest: '', waist: '', shoulder: '', sleeveLength: '', armhole: '' },
            kurta: { length: '', chest: '', waist: '', seatHips: '', flare: '', shoulder: '', armhole: '', sleeve: '', bottomOpening: '', frontNeck: '', backNeck: '' },
            dhoti: { length: '', waist: '', hip: '', sideLength: '', foldLength: '' },
            custom: ''
          },
          photo: null
        });
        setPhotoPreview(null);
        setErrors({});
        setEditingCustomer(null);
        setMeasurementProfiles([]);
        setShowEditModal(false);
      }
    } catch (error) {
      console.error('Error updating customer measurements:', error);
      setErrors({ api: error.message || 'Failed to update customer measurements' });
    }
  };

  const handleDelete = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;

    setIsDeleting(true);

    // Get JWT token
    let token = localStorage.getItem('token');
    if (!token) {
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          token = userData.jwt || userData.token;
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }

    if (!token) {
      setErrors({ api: 'Authentication error. Please login again.' });
      setIsDeleting(false);
      setShowDeleteModal(false);
      return;
    }

    try {
      console.log('Deleting customer with ID:', customerToDelete.id);

      const result = await customerAPI.deleteCustomer(customerToDelete.id, token);

      console.log('Delete API Result:', result);

      if (result.success) {
        // Remove from local state
        setCustomers(prev => prev.filter(c => c.id !== customerToDelete.id));
        
        // Show success message
        setSuccessMessage({
          title: 'Customer Deleted Successfully!',
          description: 'The customer and all associated data have been permanently deleted.'
        });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);

        // Close modal
        setShowDeleteModal(false);
        setCustomerToDelete(null);

        // Refresh the customers list from backend
        await fetchCustomers();
      } else {
        console.error('Failed to delete customer:', result.error);
        
        // Check for specific error types
        if (result.error.includes('DELETE') && result.error.includes('not supported')) {
          setErrors({ 
            api: `Backend Error: The DELETE endpoint is not implemented yet.\n\n${result.error}\n\nPlease contact the backend team.` 
          });
        } else if (result.error.includes('foreign key constraint') || result.error.includes('measurement_profiles')) {
          // Foreign key constraint error
          setErrors({ 
            api: `Cannot delete customer: This customer has associated measurement profiles.\n\nThis is a backend database issue. The backend needs to implement cascade delete or manually delete related records first.\n\nPlease contact the backend team to fix this issue.\n\nTechnical details: ${result.error}` 
          });
        } else {
          setErrors({ api: result.error });
        }
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      setErrors({ api: 'An error occurred while deleting the customer. Please try again.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCustomerToDelete(null);
  };

  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };


  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="owner" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            {/* Success Message */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -50, scale: 0.9 }}
                  className="fixed top-6 right-6 z-50 bg-white dark:bg-gray-800 border-l-4 border-green-500 rounded-lg shadow-2xl p-6 max-w-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {successMessage.title || 'Customer Added Successfully!'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {successMessage.description || 'The customer has been added and can now place orders.'}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowSuccess(false)}
                      className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Customer Management</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your customers and their profiles</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                Add Customer
              </motion.button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Customers Grid */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Customers List ({filteredCustomers.length})
              </h2>
              
              {/* Loading State */}
              {isLoading ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"
                  />
                  <p className="text-gray-600 dark:text-gray-400">Loading customers...</p>
                </div>
              ) : fetchError ? (
                /* Error State */
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                  <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 dark:text-red-400 mb-4">{fetchError}</p>
                  <button
                    onClick={fetchCustomers}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredCustomers.length === 0 ? (
                /* Empty State */
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                  <UserPlus className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery ? 'No customers found matching your search.' : 'No customers yet. Add your first customer!'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Customers Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {paginatedCustomers.map((customer) => (
                      <CustomerCard
                        key={customer.id}
                        customer={customer}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      {/* Previous Button */}
                      <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${
                          currentPage === 1
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                      </button>

                      {/* Page Numbers */}
                      {getPageNumbers().map((page, index) => (
                        page === '...' ? (
                          <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500 dark:text-gray-400">
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-orange-500 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      ))}

                      {/* Next Button */}
                      <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${
                          currentPage === totalPages
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && customerToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={cancelDelete}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full"
            >
              {/* Modal Header */}
              <div className="bg-red-50 dark:bg-red-900/20 px-6 py-4 rounded-t-2xl border-b border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-red-900 dark:text-red-100">Delete Customer</h2>
                    <p className="text-sm text-red-700 dark:text-red-300">This action cannot be undone</p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-gray-100">{customerToDelete.name}</span>?
                </p>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                    ⚠️ This will permanently delete:
                  </p>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 ml-4">
                    <li>• Customer profile and account</li>
                    <li>• All orders and order items</li>
                    <li>• All measurements and profiles</li>
                    <li>• All associated data</li>
                  </ul>
                </div>

                {errors.api && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                    <p className="text-sm text-red-800 dark:text-red-200">{errors.api}</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 px-6 pb-6">
                <button
                  onClick={cancelDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  No, Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    'Yes, Delete'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Customer Modal */}
      <AnimatePresence>
        {showViewModal && selectedCustomerForView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Customer Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Customer Info */}
                <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {selectedCustomerForView.avatar ? (
                    <img
                      src={selectedCustomerForView.avatar}
                      alt={selectedCustomerForView.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <User className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{selectedCustomerForView.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedCustomerForView.email}</p>
                    <p className="text-gray-600 dark:text-gray-400">{selectedCustomerForView.phone}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedCustomerForView.totalOrders}</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{selectedCustomerForView.totalSpent}</p>
                  </div>
                </div>

                {/* Measurements from API */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Measurement Profiles</h3>
                  
                  {isLoadingMeasurements ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Loading measurements...</p>
                    </div>
                  ) : measurementProfiles.length > 0 ? (
                    <div className="space-y-4">
                      {measurementProfiles.map((profile) => (
                        <div key={profile.profileId} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                              <span className="text-xl">
                                {profile.dressType === 'PANT' && '👖'}
                                {profile.dressType === 'SHIRT' && '👔'}
                                {profile.dressType === 'COAT' && '🧥'}
                                {profile.dressType === 'KURTA' && '🥻'}
                                {profile.dressType === 'DHOTI' && '🎽'}
                                {profile.dressType === 'CUSTOM' && '📏'}
                              </span>
                              {profile.dressType} Measurements
                            </h4>
                            {profile.notes && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                                {profile.notes}
                              </span>
                            )}
                          </div>
                          
                          {profile.measurements && Object.keys(profile.measurements).length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {Object.entries(profile.measurements).map(([key, value]) => (
                                <div key={key}>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                  </p>
                                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                                    {value}{typeof value === 'number' ? '"' : ''}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {profile.notes || 'No measurements recorded'}
                            </p>
                          )}
                          
                          {profile.updatedAt && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                              Last updated: {new Date(profile.updatedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <div className="text-4xl mb-3">📏</div>
                      <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">No measurement profiles found</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        This customer doesn't have any measurements yet.
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        Click "Edit Customer" to add measurements
                      </p>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Customer ID:</span> {selectedCustomerForView.id}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <span className="font-medium">Join Date:</span> {selectedCustomerForView.joinDate}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleEdit(selectedCustomerForView.id);
                    }}
                    className="flex-1 py-3 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
                  >
                    Edit Customer
                  </button>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="flex-1 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Customer Modal */}
      <AnimatePresence>
        {showEditModal && editingCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowEditModal(false);
              setEditingCustomer(null);
              setPhotoPreview(null);
              setErrors({});
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Customer</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCustomer(null);
                    setPhotoPreview(null);
                    setErrors({});
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              {/* Modal Body - Same as Add Customer Modal */}
              <div className="p-6">
                {/* Basic Information */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 ${
                        errors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Enter customer name"
                    />
                    {errors.name && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={customerForm.mobile}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        handleInputChange('mobile', value.slice(0, 10));
                      }}
                      maxLength="10"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 ${
                        errors.mobile ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="1234567890"
                    />
                    {errors.mobile && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.mobile}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Must be exactly 10 digits
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={customerForm.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 ${
                        errors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="customer@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Customer Photo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Customer Photo
                    </label>
                    
                    {!photoPreview ? (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-orange-500 transition-colors dark:bg-gray-700">
                        <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Click to upload</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">JPG, PNG (max 5MB)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="relative w-32 h-32">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={handleRemovePhoto}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    {errors.photo && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.photo}</p>
                    )}
                  </div>
                </div>

                {/* Measurements Section */}
                <MeasurementInputs 
                  measurements={customerForm.measurements} 
                  onChange={handleMeasurementChange} 
                />

                {/* Modal Footer */}
                <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingCustomer(null);
                      setPhotoPreview(null);
                      setErrors({});
                    }}
                    className="flex-1 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateCustomer}
                    className="flex-1 py-3 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
                  >
                    Update Customer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add New Customer</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* API Error Message */}
                {errors.api && (
                  <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 flex items-center gap-3">
                    <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span className="text-red-800 dark:text-red-300 font-medium">
                      {errors.api}
                    </span>
                  </div>
                )}

                {/* Basic Information */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 ${
                        errors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Enter customer name"
                    />
                    {errors.name && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={customerForm.mobile}
                      onChange={(e) => handleInputChange('mobile', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 ${
                        errors.mobile ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="+1234567890"
                    />
                    {errors.mobile && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.mobile}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={customerForm.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 ${
                        errors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="customer@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={customerForm.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 ${
                          errors.password ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.password}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Minimum 6 characters
                    </p>
                  </div>

                  {/* Customer Photo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Customer Photo
                    </label>
                    
                    {!photoPreview ? (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-orange-500 transition-colors dark:bg-gray-700">
                        <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Click to upload</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">JPG, PNG (max 5MB)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="relative w-32 h-32">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={handleRemovePhoto}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    {errors.photo && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.photo}</p>
                    )}
                  </div>
                </div>

                {/* Measurements Section */}
                <MeasurementInputs 
                  measurements={customerForm.measurements} 
                  onChange={handleMeasurementChange} 
                />

                {/* Modal Footer */}
                <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                    onClick={handleAddCustomer}
                    disabled={isSubmitting}
                    className={`flex-1 py-3 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2 ${
                      isSubmitting 
                        ? 'bg-orange-400 cursor-not-allowed opacity-70' 
                        : 'bg-orange-500 hover:bg-orange-600'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding...
                      </>
                    ) : (
                      'Add Customer'
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Customers;
