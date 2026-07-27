describe('Initial Setup Testing', () => {
  it('should verify that true is equal to true', () => {
    const isWorking = true;
    expect(isWorking).toBe(true);
  });

  it('should perform basic math correctly', () => {
    const sum = 2 + 2;
    expect(sum).toBe(4);
  });
});
