import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function CandidateTermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Terms
          </Link>
          <Link href="/">
            <Button variant="outline">Home</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            SkillVee Candidate Terms of Service
          </h1>

          <p className="text-gray-600 mb-8">
            This Agreement is made between the individual using our platform ('Candidate') and SkillVee Corporation ('SkillVee'). 
            Candidates may be connected with employers, recruiters, and hiring managers ('Companies') through our AI-powered interview platform.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Non-Circumvention</h2>
          <p className="text-gray-700 mb-4">
            Candidate acknowledges that SkillVee has a proprietary interest in the relationships it has with its Companies, partners, and contacts. 
            Candidate understands that they may be introduced to these parties directly or indirectly through the course of using the SkillVee platform.
          </p>
          <p className="text-gray-700 mb-4">
            Candidate agrees not to work directly or indirectly, in a paid or unpaid capacity, for any Company that SkillVee introduces them to 
            during their use of the platform and for a period of <strong>12 months</strong> following their last platform interaction, without obtaining 
            the prior written consent of SkillVee.
          </p>
          <p className="text-gray-700 mb-6">
            Any breach of this provision shall be considered a material breach of this agreement and may result in legal action and immediate 
            termination of platform access.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Interview Process and Communications</h2>
          <p className="text-gray-700 mb-4">
            The Candidate agrees to conduct all interview scheduling, compensation discussions, and hiring communications exclusively through 
            the SkillVee platform. Direct negotiations with Companies outside of the platform are prohibited and may result in immediate 
            termination of platform access.
          </p>
          <p className="text-gray-700 mb-6">
            All interview recordings, assessments, and performance data generated through SkillVee remain the property of SkillVee and may be 
            used for platform improvement and analytics purposes.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Platform Usage and Conduct</h2>
          <p className="text-gray-700 mb-2">Candidates must:</p>
          <ul className="list-disc list-inside text-gray-700 mb-6 ml-4">
            <li>Provide accurate and truthful information in their profiles and during interviews</li>
            <li>Maintain professional conduct during all platform interactions</li>
            <li>Respect intellectual property rights of interview materials and assessments</li>
            <li>Not attempt to circumvent or manipulate the AI assessment system</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Data and Privacy</h2>
          <p className="text-gray-700 mb-6">
            By using SkillVee, Candidates consent to the collection, processing, and storage of their interview data, including video recordings, 
            audio transcriptions, and performance assessments. This data may be shared with Companies for legitimate hiring purposes.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Modification of Terms</h2>
          <p className="text-gray-700 mb-4">
            SkillVee reserves the right to modify, update, or change these Terms of Service at any time without prior notice. Any changes will 
            be effective immediately upon posting the revised Terms of Service on the SkillVee platform.
          </p>
          <p className="text-gray-700 mb-4">
            SkillVee will make best efforts to notify users of any material changes through email or platform notifications. However, it is the 
            Candidate's responsibility to review the Terms of Service periodically for updates.
          </p>
          <p className="text-gray-700 mb-6">
            The Candidate's continued use of the SkillVee platform after posting of any changes constitutes their acceptance of the revised Terms 
            of Service. If the Candidate does not agree to the revised Terms of Service, they must discontinue their use of the platform.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Termination</h2>
          <p className="text-gray-700 mb-6">
            Either party may terminate this agreement at any time. Upon termination, the non-circumvention clause shall remain in effect for the 
            specified period, and all generated data and assessments remain the property of SkillVee.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Governing Law</h2>
          <p className="text-gray-700 mb-6">
            This agreement shall be governed by and construed in accordance with the laws of [Jurisdiction], and any disputes shall be resolved 
            through binding arbitration.
          </p>

          <hr className="my-8 border-gray-300" />
          
          <p className="text-sm text-gray-500 italic">
            <strong>Last Updated:</strong> [Date]<br/>
            By continuing to use SkillVee, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}