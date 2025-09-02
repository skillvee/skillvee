import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function CompanyTermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/terms" className="text-purple-600 hover:text-purple-700 font-medium">
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
            SkillVee Company Terms of Service
          </h1>

          <p className="text-gray-600 mb-8">
            This Agreement is made between the organization using our hiring platform ('Company') and SkillVee Corporation ('SkillVee'). 
            Companies may access and evaluate candidates ('Candidates') through our AI-powered interview platform.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Platform Usage and Access</h2>
          <p className="text-gray-700 mb-6">
            Companies agree to use the SkillVee platform solely for legitimate hiring and recruitment purposes. Company accounts must be created 
            by authorized personnel with proper hiring authority within the organization.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Candidate Interactions and Hiring</h2>
          <p className="text-gray-700 mb-4">
            Companies agree to conduct all candidate communications, interview scheduling, and hiring discussions exclusively through the SkillVee 
            platform during the evaluation period.
          </p>
          <p className="text-gray-700 mb-2">If a Company wishes to hire a Candidate introduced through SkillVee, they must:</p>
          <ul className="list-disc list-inside text-gray-700 mb-6 ml-4">
            <li>Complete the hiring process through the SkillVee platform</li>
            <li>Pay applicable placement fees as outlined in the separate Service Agreement</li>
            <li>Provide hiring confirmation within 30 days of making an offer</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Non-Solicitation of Platform Candidates</h2>
          <p className="text-gray-700 mb-4">
            Companies acknowledge that SkillVee has invested significant resources in sourcing, screening, and presenting Candidates. Companies 
            agree not to directly solicit, recruit, or hire any Candidate they encounter through SkillVee without completing the proper platform 
            processes and fee arrangements.
          </p>
          <p className="text-gray-700 mb-6">
            This restriction applies for <strong>24 months</strong> after the Company's last interaction with a Candidate through the platform, 
            unless alternative arrangements are made in writing with SkillVee.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Data Usage and Confidentiality</h2>
          <p className="text-gray-700 mb-2">
            Companies may access Candidate assessment data, interview recordings, and AI-generated insights solely for hiring evaluation purposes. 
            Companies agree to:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-6 ml-4">
            <li>Maintain confidentiality of all Candidate data</li>
            <li>Not share assessment materials outside their hiring team</li>
            <li>Delete Candidate data upon request or within 12 months of evaluation completion</li>
            <li>Use data only for the intended hiring decision</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Intellectual Property</h2>
          <p className="text-gray-700 mb-6">
            All AI assessments, interview formats, evaluation criteria, and platform methodology remain the exclusive intellectual property of 
            SkillVee. Companies may not reverse-engineer, replicate, or use these materials outside the platform.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Payment Terms</h2>
          <p className="text-gray-700 mb-6">
            Companies agree to pay all applicable fees as outlined in the separate Service Agreement. This includes but may not be limited to: 
            platform access fees, per-interview charges, and successful placement fees.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Compliance and Fair Hiring</h2>
          <p className="text-gray-700 mb-6">
            Companies warrant that their use of SkillVee complies with all applicable employment laws, anti-discrimination regulations, and fair 
            hiring practices. Companies are responsible for ensuring their hiring decisions meet all legal requirements in their jurisdiction.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Modification of Terms</h2>
          <p className="text-gray-700 mb-6">
            SkillVee reserves the right to modify these Terms of Service with 30 days written notice to Company account administrators. Continued 
            use of the platform after the notice period constitutes acceptance of revised terms.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Termination</h2>
          <p className="text-gray-700 mb-2">Either party may terminate this agreement with 30 days written notice. Upon termination:</p>
          <ul className="list-disc list-inside text-gray-700 mb-6 ml-4">
            <li>Non-solicitation obligations remain in effect for the specified period</li>
            <li>Outstanding fees become immediately due</li>
            <li>Access to Candidate data will be revoked within 30 days</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Liability and Indemnification</h2>
          <p className="text-gray-700 mb-6">
            Companies agree to indemnify SkillVee against any claims arising from their hiring decisions or use of platform data. SkillVee's 
            liability is limited to the fees paid by the Company in the 12 months preceding any claim.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Governing Law and Disputes</h2>
          <p className="text-gray-700 mb-6">
            This agreement shall be governed by the laws of [Jurisdiction]. Any disputes will be resolved through binding arbitration, with the 
            prevailing party entitled to reasonable attorneys' fees.
          </p>

          <hr className="my-8 border-gray-300" />
          
          <p className="text-sm text-gray-500 italic">
            <strong>Last Updated:</strong> [Date]<br/>
            By using SkillVee's platform, Company acknowledges acceptance of these Terms of Service and agrees to be legally bound by their provisions.
          </p>
        </div>
      </div>
    </div>
  );
}