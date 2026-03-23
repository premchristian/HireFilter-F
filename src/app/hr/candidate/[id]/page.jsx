export default function CandidateProfilePage({ params }) {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Candidate Profile
            </h1>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                 <p className="text-gray-400">Profile for Candidate ID: {params.id}</p>
            </div>
        </div>
    );
}
