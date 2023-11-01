import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement,  VStack, useToast } from '@chakra-ui/react'
// import { set } from 'mongoose';
import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const Singnup = () => {
    const [Show, setShow] = useState(false);
    const handleClick = () => setShow(!Show);
    const toast = useToast();
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [confirmPassword, setConfirmPassword] = useState();
    const [Loading, setLoading] = useState(false);
    const [pic, setPic] = useState();
    const history = useHistory();
    const postDetails = (pics) => {
        setLoading(true);
        if (pics === undefined) {
            toast({
                title: 'Please Select a Profile Picture',
                status: 'warning',
                duration: 7000,
                isClosable: true,
            });
            return;
        }

        // console.log(pics);
        if (pics.type === 'image/jpeg' || pics.type === 'image/png') {
            const data = new FormData();
            data.append('file', pics);
            data.append('upload_preset', 'name here');
            data.append('cloud_name', 'name here');
            fetch('', {//cloudinary url here
                method: 'post',
                body: data,
            }).then((res) => res.json())
                .then((data) => {
                    setPic(data.url.toString());
                    // console.log(data.url.toString()); //for url only
                    // console.log(data); // all image data 
                    setLoading(false);
                }).catch((err) => {
                    console.log(err);
                    setLoading(false);
                });
        } else {
            toast({
                title: 'Please Select a Image!',
                status: 'warning',
                duration: 7000,
                isClosable: true,
            });
            setLoading(false);
            return;
        }

    };
    const submitHandler = async () => {
        setLoading(true);
        if (name === undefined || email === undefined || password === undefined || confirmPassword === undefined) {
            toast({
                title: 'Please Fill All The Fields',
                status: 'warning',
                duration: 7000,
                isClosable: true,
            });
            setLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            toast({
                title: 'Password Does Not Match',
                status: 'warning',
                duration: 7000,
                isClosable: true,
            });
            setLoading(false);
            return;
        }
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            const { data } = await axios.post(
                '/api/user',
                { name, email, password, pic },
                config
            );
            toast({
                title: 'Account Created Successfully',
                status: 'success',
                duration: 7000,
                isClosable: true,
            });
            localStorage.setItem('userInfo', JSON.stringify(data));
            setLoading(false);
            history.push('/chats');
        } catch (error) {
            toast({
                title: "Error Occured",
                description: error.response.data.message,
                status: 'error',
                duration: 7000,
                isClosable: true,
            });
            setLoading(false);
        }
    };
    return (
        <VStack spacing={'5px'} color={'black'}>
            <FormControl id='first-name' isRequired>
                <FormLabel>Username</FormLabel>
                <Input type='text' placeholder='Enter Your Name'
                    onChange={(e) => setName(e.target.value)} />
            </FormControl>
            <FormControl id='email' isRequired>
                <FormLabel>Email</FormLabel>
                <Input type='email' placeholder='Enter Your Email'
                    onChange={(e) => setEmail(e.target.value)} />
            </FormControl>
            <FormControl id='password' isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup size={'md'}>
                    <Input type={Show ? "text" : 'password'} placeholder='Enter Your Password'
                        onChange={(e) => setPassword(e.target.value)} />
                    <InputRightElement width={'4.5rem'}>
                        <Button h='1.75rem' size='sm' onClick={handleClick}>
                            {Show ? 'Hide' : 'Show'}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <FormControl id='password' isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup size={'md'}>
                    <Input type={Show ? "text" : 'password'} placeholder='Confirm Your Password'
                        onChange={(e) => setConfirmPassword(e.target.value)} />
                    <InputRightElement width={'4.5rem'}>
                        <Button h='1.75rem' size='sm' onClick={handleClick}>
                            {Show ? 'Hide' : 'Show'}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <FormControl id='pic' isRequired>
                <FormLabel>Upload Profile Picture</FormLabel>
                <Input type='file'
                    p={1}
                    accept='image/*'
                    onChange={(e) => postDetails(e.target.files[0])} />
            </FormControl>
            <Button colorScheme='linkedin' width={'100%'}
                style={{ marginTop: 15 }} onClick={submitHandler}
                isLoading={Loading}>Sign Up</Button>
        </VStack>
    )
}

export default Singnup