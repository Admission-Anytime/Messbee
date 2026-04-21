import axios from "../context/axios";

const QuickReplyApi = {
    getQuickReplies: async () => {
        try {
            const response = await axios.get("/quick-replies");
            return response.data;
        } catch (error) {
            console.error("Error fetching quick replies:", error);
            throw error;
        }
    },
    createQuickReply: async (formData) => {
        try {
            const response = await axios.post("/quick-replies", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            console.error("Error creating quick reply:", error);
            throw error;
        }
    },
    updateQuickReply: async (id, formData) => {
        try {
            const response = await axios.put(`/quick-replies/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            console.error("Error updating quick reply:", error);
            throw error;
        }
    },
    deleteQuickReply: async (id) => {
        try {
            const response = await axios.delete(`/quick-replies/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting quick reply:", error);
            throw error;
        }
    }
};

export default QuickReplyApi;
