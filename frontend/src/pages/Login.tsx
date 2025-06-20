import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Heading, Text, Link, VStack, InputGroup, 
	InputRightElement, IconButton, useToast 
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { loginUser } from '../utils/api';
import { useUser } from '../contexts/UserContext';

const accent = 'teal.500';
const cardBg = 'white';
const pageBg = 'gray.50';
const textColor = 'gray.800';

const Login: React.FC = () => {
	const [showPassword, setShowPassword] = useState(false);
	const [email, setEmail] = useState('example123@gmail.com');
	const [password, setPassword] = useState('123456');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const toast = useToast();
	const navigate = useNavigate();
	const { setUser } = useUser();

	const handleShowClick = () => setShowPassword(!showPassword);
  

  	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email || !password) {
			toast({
				title: 'Login Failed',
				description: 'Please enter both email and password',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
			return;
		}
		
		setIsSubmitting(true);
		
		try {
			// Use frontend API service to login
			console.log('About to call loginUser with:', { email, password });
			const user = await loginUser(email, password);

			console.log('Login successful! User:', user);

			// Store user in context and localStorage
			setUser(user);
			
			// Show success message
			toast({
				title: 'Login Successful',
				description: `Welcome back, ${user.email}!`,
				status: 'success',
				duration: 2000,
				isClosable: true,
			});

			// Navigate to dashboard
			navigate('/dashboard');
		} catch (error) {
			console.error('Login error:', error);
		
			// Display error message
			let errorMessage = 'Invalid email or password';
			if (error instanceof Error) {
				errorMessage = error.message;
			}
		
			toast({
				title: 'Login Failed',
				description: errorMessage,
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsSubmitting(false);
		}
  	};

  
  	return (
		<Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg={pageBg} color={textColor}>
			<Box bg={cardBg} p={8} rounded="lg" boxShadow="sm" w={{ base: '90%', sm: '400px' }} border="1px solid" borderColor="gray.100">
				<VStack spacing={6} as="form" onSubmit={handleLogin}>
					<Heading size="lg" color={accent}>Login</Heading>
					<FormControl id="email" isRequired>
						<FormLabel>Email</FormLabel>
						<Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" bg={pageBg} color={textColor} borderColor={accent} _focus={{ borderColor: accent }} isDisabled={isSubmitting} />
					</FormControl>
					<FormControl id="password" isRequired>
						<FormLabel>Password</FormLabel>
						<InputGroup>
							<Input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" bg={pageBg} color={textColor} borderColor={accent} _focus={{ borderColor: accent }} isDisabled={isSubmitting} />
							<InputRightElement>
								<IconButton aria-label={showPassword ? 'Hide password' : 'Show password'} icon={showPassword ? <ViewOffIcon /> : <ViewIcon />} size="sm" onClick={handleShowClick} variant="ghost" color={accent} />
							</InputRightElement>
						</InputGroup>
					</FormControl>
					<Button colorScheme="teal" type="submit" w="full" variant="solid">Login</Button>
					<Text fontSize="sm">Don't have an account? <Link as={RouterLink} to="/register" color={accent}>Register</Link></Text>
				</VStack>
			</Box>
		</Box>
  	);
};

export default Login; 