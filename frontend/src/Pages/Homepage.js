import { Box, Container, Text, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import React, { useEffect } from 'react'
import Login from '../components/Authentication/Login';
import Singnup from '../components/Authentication/Singnup';
import { useHistory } from 'react-router-dom';

const Homepage = () => {
    const history = useHistory();
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            history.push('/chats');
        }
    }, [history]);
    
    return (
        <Container maxWidth='xl' centerContent>
            <Box
                display='flex'
                justifyContent="center"
                padding={3}
                width="100%"
                margin="40px 0 15px 0"
                borderRadius="lg"
                borderWidth="1px"
                bg={'whatsapp.100'}>
                <Text fontSize='4xl' fontWeight={'bold'} fontStyle={'italic'}>Ronex-Chat</Text>
            </Box>
            <Box bg={'whatsapp.100'} width={'100%'} borderRadius={'lg'} borderWidth={'1px'} padding={4} color={'black'}>
                <Tabs variant='soft-rounded' colorScheme='messenger'>
                    <TabList marginBottom={'1em'}>
                        <Tab width={'50%'}>Login</Tab>
                        <Tab width={'50%'}>Sign Up</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <Login /> 
                        </TabPanel>
                        <TabPanel>
                            <Singnup/>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>
        </Container>
    );
}

export default Homepage;