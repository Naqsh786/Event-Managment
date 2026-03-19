import axios from 'axios';

const categoryId = "698f315b32dac7225faeebd7"; // Wedding from debug output
const url = `http://localhost:7000/event/category/${categoryId}`;

const testApi = async () => {
    try {
        const response = await axios.get(url);
        console.log("Status:", response.status);
        console.log("Data Length:", response.data.length);
        console.log("First Event:", JSON.stringify(response.data[0], null, 2));
    } catch (error) {
        console.error("Error:", error.message);
        if (error.response) {
            console.error("Response Data:", error.response.data);
        }
    }
};

testApi();
