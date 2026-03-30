namespace RecruitEase.API.Models;

public enum JobType { FullTime, PartTime, Contract, Internship, Remote }
public enum JobStatus { Draft, Active, Paused, Closed, Filled }
public enum ResumeStatus { Received, UnderReview, Shortlisted, Rejected, InterviewScheduled, Hired }
public enum InterviewType { Phone, Video, InPerson, Technical, HR, Final }
public enum InterviewStatus { Scheduled, Completed, Cancelled, NoShow, PendingFeedback }
public enum CommunicationType { Shortlisted, InterviewInvite, Rejection, OfferLetter, Custom }
public enum NaukriPostingStatus { Pending, Posted, Active, Expired, Failed }
