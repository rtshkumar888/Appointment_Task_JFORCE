public class AppointmentBook {
@AuraEnabled
    public static List<Appointment_Slots__c> getAppointmentSlots(DateTime dt){
        if(dt!=null){
            Date dt1=dt.date();
            Time tm1=dt.timeGmt();
            system.debug('Time from apex method::: '+tm1);
            return [SELECT Id, Name, Appointment_Date__c, Start_Time__c, End_Time__c, IsActive__c from Appointment_Slots__c 
            WHERE IsActive__c=true AND Appointment_Date__c=:dt1 AND Start_Time__c<=:tm1 AND End_Time__c>:tm1];
        }
        return null;
    }
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContacts(string searchTerm){
       List<Contact> conList=new List<Contact>(); 
   
           if(searchTerm!=''){
            string str='%'+ searchTerm + '%';
            conList= Database.query('SELECT Id, Name FROM Contact WHERE Name LIKE: str LIMIT 7');

           }
           else{
             conList= Database.query('SELECT Id, Name FROM Contact LIMIT 7');
           }
       return conList;
    }


}