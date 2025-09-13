import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Keypoints } from '../../types/Keypoints';

export interface DataState {
    userPoseImage: string | null;
    userPoseKeypoints: Keypoints | null;
    similarImageFilenames: string[];
    editedImages: string[];
    improvementSuggestions: string[];
}

const initialState: DataState = {
    userPoseImage: null,
    userPoseKeypoints: null,
    similarImageFilenames: [],
    editedImages: [],
    improvementSuggestions: []
};

export const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        setUserPoseImage: (state, action: PayloadAction<string>) => {
            state.userPoseImage = action.payload;
        },
        clearUserPoseImage: (state) => {
            state.userPoseImage = null;
        },
        setUserPoseKeypoints: (state, action: PayloadAction<Keypoints>) => {
            state.userPoseKeypoints = action.payload;
        },
        clearUserPoseKeypoints: (state) => {
            state.userPoseKeypoints = null;
        },
        setSimilarImageFilenames: (state, action: PayloadAction<string[]>) => {
            state.similarImageFilenames = action.payload;
        },
        addSimilarImageFilename: (state, action: PayloadAction<string>) => {
            if (!state.similarImageFilenames.includes(action.payload)) {
                state.similarImageFilenames.push(action.payload);
            }
        },
        removeSimilarImageFilename: (state, action: PayloadAction<string>) => {
            state.similarImageFilenames = state.similarImageFilenames.filter(
                filename => filename !== action.payload
            );
        },
        clearSimilarImageFilenames: (state) => {
            state.similarImageFilenames = [];
        },
        setEditedImages: (state, action: PayloadAction<string[]>) => {
            state.editedImages = action.payload;
        },
        addEditedImage: (state, action: PayloadAction<string>) => {
            state.editedImages.push(action.payload);
        },
        removeEditedImage: (state, action: PayloadAction<number>) => {
            state.editedImages.splice(action.payload, 1);
        },
        clearEditedImages: (state) => {
            state.editedImages = [];
        },
        setImprovementSuggestions: (state, action: PayloadAction<string[]>) => {
            state.improvementSuggestions = action.payload;
        },
        addImprovementSuggestion: (state, action: PayloadAction<string>) => {
            if (!state.improvementSuggestions.includes(action.payload)) {
                state.improvementSuggestions.push(action.payload);
            }
        },
        removeImprovementSuggestion: (state, action: PayloadAction<number>) => {
            state.improvementSuggestions.splice(action.payload, 1);
        },
        clearImprovementSuggestions: (state) => {
            state.improvementSuggestions = [];
        },
        clearAllData: (state) => {
            state.userPoseImage = null;
            state.userPoseKeypoints = null;
            state.similarImageFilenames = [];
            state.editedImages = [];
            state.improvementSuggestions = [];
        }
    }
});

export const {
    setUserPoseImage,
    clearUserPoseImage,
    setUserPoseKeypoints,
    clearUserPoseKeypoints,
    setSimilarImageFilenames,
    addSimilarImageFilename,
    removeSimilarImageFilename,
    clearSimilarImageFilenames,
    setEditedImages,
    addEditedImage,
    removeEditedImage,
    clearEditedImages,
    setImprovementSuggestions,
    addImprovementSuggestion,
    removeImprovementSuggestion,
    clearImprovementSuggestions,
    clearAllData
} = dataSlice.actions;

// Selectors
export const selectUserPoseImage = (state: { data: DataState }) => state.data.userPoseImage;
export const selectUserPoseKeypoints = (state: { data: DataState }) => state.data.userPoseKeypoints;
export const selectSimilarImageFilenames = (state: { data: DataState }) => state.data.similarImageFilenames;
export const selectEditedImages = (state: { data: DataState }) => state.data.editedImages;
export const selectImprovementSuggestions = (state: { data: DataState }) => state.data.improvementSuggestions;
export const selectAllData = (state: { data: DataState }) => state.data;

export default dataSlice.reducer;