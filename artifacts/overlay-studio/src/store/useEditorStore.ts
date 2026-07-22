import { create } from 'zustand';
import { EditorElement, BaseMedia, ElementType } from '../types';

interface EditorState {
  baseMedia: BaseMedia | null;
  elements: EditorElement[];
  selectedId: string | null;
  
  // Actions
  setBaseMedia: (media: BaseMedia | null) => void;
  addElement: (element: Omit<EditorElement, 'id'>) => void;
  updateElement: (id: string, updates: Partial<EditorElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  reorderElements: (startIndex: number, endIndex: number) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  clearAll: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  baseMedia: null,
  elements: [],
  selectedId: null,

  setBaseMedia: (media) => set({ baseMedia: media, elements: [], selectedId: null }),

  addElement: (element) => set((state) => {
    const id = crypto.randomUUID();
    const newElement = { ...element, id } as EditorElement;
    return {
      elements: [...state.elements, newElement],
      selectedId: id,
    };
  }),

  updateElement: (id, updates) => set((state) => ({
    elements: state.elements.map((el) => 
      el.id === id ? { ...el, ...updates } as EditorElement : el
    ),
  })),

  deleteElement: (id) => set((state) => ({
    elements: state.elements.filter((el) => el.id !== id),
    selectedId: state.selectedId === id ? null : state.selectedId,
  })),

  selectElement: (id) => set({ selectedId: id }),

  reorderElements: (startIndex, endIndex) => set((state) => {
    const result = Array.from(state.elements);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return { elements: result };
  }),

  moveLayerUp: (id) => set((state) => {
    const index = state.elements.findIndex(el => el.id === id);
    if (index === -1 || index === state.elements.length - 1) return state;
    const newElements = [...state.elements];
    const temp = newElements[index + 1];
    newElements[index + 1] = newElements[index];
    newElements[index] = temp;
    return { elements: newElements };
  }),

  moveLayerDown: (id) => set((state) => {
    const index = state.elements.findIndex(el => el.id === id);
    if (index <= 0) return state;
    const newElements = [...state.elements];
    const temp = newElements[index - 1];
    newElements[index - 1] = newElements[index];
    newElements[index] = temp;
    return { elements: newElements };
  }),
  
  bringToFront: (id) => set((state) => {
    const index = state.elements.findIndex(el => el.id === id);
    if (index === -1 || index === state.elements.length - 1) return state;
    const newElements = [...state.elements];
    const [item] = newElements.splice(index, 1);
    newElements.push(item);
    return { elements: newElements };
  }),
  
  sendToBack: (id) => set((state) => {
    const index = state.elements.findIndex(el => el.id === id);
    if (index <= 0) return state;
    const newElements = [...state.elements];
    const [item] = newElements.splice(index, 1);
    newElements.unshift(item);
    return { elements: newElements };
  }),

  clearAll: () => set({ baseMedia: null, elements: [], selectedId: null }),
}));
