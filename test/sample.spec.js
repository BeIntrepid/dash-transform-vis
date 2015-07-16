describe('a first test suite', () => {
    describe('a first test', () => {
        it("should run and pass", () => {
            expect(true).toBe(true);
            expect(1).toEqual(1);
            expect(false).toBeFalsy();
            expect(0).toBeFalsy();
        });
    });
});