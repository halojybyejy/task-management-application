import React, { useState, useEffect } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Heading, Text, Link, VStack, InputGroup, InputRightElement, IconButton, useToast  } from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { registerUser } from '../utils/api';

const accent = 'teal.500';
const cardBg = 'white';
const pageBg = 'gray.50';
const textColor = 'gray.800';

const Register: React.FC = () => {
	const toast = useToast();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleShowPassword = () => setShowPassword(!showPassword);
	const handleShowConfirm = () => setShowConfirm(!showConfirm);


		
	// Validate form fields
	const validateForm = (): boolean => {
		
		// Email validation (if email method is selected)
		if (!email.trim()) {
			toast({
				title: 'Sign Up Failed',
				description: 'Email is required',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
		} else {
			// More robust email validation
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email.trim())) {
				toast({
					title: 'Sign Up Failed',
					description: 'Please enter a valid email',
					status: 'error',
					duration: 3000,
					isClosable: true,
				});
			}
		}
		
		
		// Password validation
		if (!password) {
			toast({
				title: 'Sign Up Failed',
				description: 'Password is required',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
		} else if (password.length < 6) {
			return false;
		}

		return true;
	};
	
	// Handle form submission
	const handleSignUp = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!email.trim()) {
			toast({
				title: 'Sign Up Failed',
				description: 'Email is required',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
		} else {
			// More robust email validation
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email.trim())) {
				toast({
					title: 'Sign Up Failed',
					description: 'Please enter a valid email',
					status: 'error',
					duration: 3000,
					isClosable: true,
				});
			}
		}
		
		
		// Password validation
		if (!password) {
			toast({
				title: 'Sign Up Failed',
				description: 'Password is required',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
		} else if (password.length < 6) {
			toast({
				title: 'Sign Up Failed',
				description: 'Password must be at least 6 characters',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
		}

		if (!confirmPassword || confirmPassword !== password) {
			toast({
				title: 'Sign Up Failed',
				description: 'Passwords do not match',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
		}

		if (!email.trim() || !password || !confirmPassword || confirmPassword !== password) {
			return;
		}

		setIsSubmitting(true);
		
		try {
			// Prepare clean inputs
			const cleanEmail = email.trim().toLowerCase();
			
			// Use the auth service to sign up
			const response = await registerUser(
				cleanEmail, 
				password, 
			);
			
			console.log('Sign up successful:', response);
			
			// Store minimal user data in AsyncStorage
			// For example: await AsyncStorage.setItem('user_id', response.id.toString());
			
			// Navigate to next screen on success
			window.location.href = '/login';
		} catch (error) {
			console.error('Sign up error:', error);
			
			// Enhanced error handling for specific errors
			let errorMessage = 'An error occurred during sign up. Please try again.';
			
			if (typeof error === 'string') {
				errorMessage = error;
			} else if (error instanceof Error) {
				errorMessage = error.message;
				
				// Handle specific error cases
				if (errorMessage.toLowerCase().includes('email')) {
					toast({
						title: 'Sign Up Failed',
						description: 'Invalid email format or email already registered',
						status: 'error',
						duration: 3000,
						isClosable: true,
					});
				} else if (errorMessage.toLowerCase().includes('password')) {
					toast({
						title: 'Sign Up Failed',
						description: 'Invalid password. Must be at least 6 characters',
						status: 'error',
						duration: 3000,
						isClosable: true,
					});
				}
			}
		} finally {
			setIsSubmitting(false);
		}
	};
	


	return (
		<Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg={pageBg} color={textColor}>
			<Box bg={cardBg} p={8} rounded="lg" boxShadow="sm" w={{ base: '90%', sm: '400px' }} border="1px solid" borderColor="gray.100">
				<VStack spacing={6} as="form">
					<Heading size="lg" color={accent}>Register</Heading>
					<FormControl id="email" isRequired>
						<FormLabel>Email</FormLabel>
						<Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" bg={pageBg} color={textColor} borderColor={accent} _focus={{ borderColor: accent }} isDisabled={isSubmitting} />
					</FormControl>
					<FormControl id="password" isRequired>
						<FormLabel>Password</FormLabel>
						<InputGroup>
							<Input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" bg={pageBg} color={textColor} borderColor={accent} _focus={{ borderColor: accent }}  isDisabled={isSubmitting} />
							<InputRightElement>
								<IconButton aria-label={showPassword ? 'Hide password' : 'Show password'} icon={showPassword ? <ViewOffIcon /> : <ViewIcon />} size="sm" onClick={handleShowPassword} variant="ghost" color={accent} />
							</InputRightElement>
						</InputGroup>
					</FormControl>
					<FormControl id="confirmPassword" isRequired>
						<FormLabel>Confirm Password</FormLabel>
						<InputGroup>
							<Input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm your password" bg={pageBg} color={textColor} borderColor={accent} _focus={{ borderColor: accent }} />
							<InputRightElement>
								<IconButton aria-label={showConfirm ? 'Hide password' : 'Show password'} icon={showConfirm ? <ViewOffIcon /> : <ViewIcon />} size="sm" onClick={handleShowConfirm} variant="ghost" color={accent} />
							</InputRightElement>
						</InputGroup>
					</FormControl>
					<Button colorScheme="teal" type="submit" w="full" variant="solid" isDisabled={ isSubmitting} onClick={handleSignUp}>Register</Button>
					<Text fontSize="sm">Already have an account? <Link as={RouterLink} to="/login" color={accent}>Login</Link></Text>
				</VStack>
			</Box>
		</Box>
	);
};

export default Register; 