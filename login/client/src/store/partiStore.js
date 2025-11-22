// Simple in-memory store (resets on page refresh)

export const partiStore = {
    myPartis: [],
  
    addParti(parti) {
      this.myPartis.push(parti);
    },
  
    getPartis() {
      return this.myPartis;
    }
  };
  