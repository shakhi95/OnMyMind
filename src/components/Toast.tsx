export function Toast({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full bg-[#dcdeea] px-4 py-2.5 text-[10px] text-[#20271c] shadow-[0_8px_25px_#0007]"
    >
      {message}
    </div>
  );
}
